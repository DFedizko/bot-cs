import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    ACCOUNT_REPOSITORY,
    CSGOEMPIRE_TRADE_HTTP,
    WITHDRAW_ITEM_HANDLER,
    WITHDRAWAL_GATEWAY,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { WithdrawItemCommand } from "@/contexts/trading/bidding/application/withdraw-item/withdraw-item.command";
import { ItemWithdrawnEvent } from "@/contexts/trading/bidding/application/withdraw-item/item-withdrawn.event";
import { WithdrawalRejectedError } from "@/contexts/trading/bidding/application/withdraw-item/withdrawal-rejected.error";
import { WithdrawalOutcomeUnknownError } from "@/contexts/trading/bidding/application/withdraw-item/withdrawal-outcome-unknown.error";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { AccountNotFoundError } from "@/contexts/trading/bidding/domain/account/errors/account-not-found.error";
import { ReservationAlreadyExistsError } from "@/contexts/trading/bidding/domain/account/errors/reservation-already-exists.error";
import {
    CsgoempireTradeHttpFakeAdapter,
    type WithdrawFailure,
} from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-trade.http.fake-adapter";
import { activeTrades } from "@/contexts/trading/bidding/external/http/csgoempire/__mocks__/active-trades.mock";

const ACCOUNT_ID = 404220;
const ACCOUNT_NAME = "John Doe";
const ITEM_ID = 288767047;
const BALANCE = 10_000;
const VALUE = 3656;
const [ACTIVE_WITHDRAWAL] = activeTrades.data.withdrawals;

const withdrawCommand = (itemId = ITEM_ID, value = VALUE) =>
    new WithdrawItemCommand({ itemId, accountId: ACCOUNT_ID, value });

const withAccount = async (): Promise<void> => {
    await container
        .get(ACCOUNT_REPOSITORY)
        .save(Account.sync({ id: ACCOUNT_ID, name: ACCOUNT_NAME, totalAmount: BALANCE }));
};

const failingWith = (withdrawFailure: WithdrawFailure): void => {
    container.rebind(CSGOEMPIRE_TRADE_HTTP).toConstantValue(new CsgoempireTradeHttpFakeAdapter({ withdrawFailure }));
};

const findAccount = async (): Promise<Account> =>
    (await container.get(ACCOUNT_REPOSITORY).findById(new AccountId(ACCOUNT_ID))) as Account;

const silenceLogger = () => jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

let container: Container;

describe("WithdrawItemCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should throw when the account isn't found", async () => {
        const withdrawing = container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

        await expect(withdrawing).rejects.toThrow(AccountNotFoundError);
    });

    describe("When the account can't pay the item", () => {
        it("Should log it without withdrawing", async () => {
            await withAccount();
            const loggerSpy = silenceLogger();

            await container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand(ITEM_ID, BALANCE + VALUE));

            expect(loggerSpy).toHaveBeenCalledWith(
                `Couldn't withdraw item "${ITEM_ID}" because the "${ACCOUNT_NAME}" account has insufficient balance`,
            );
        });

        it("Shouldn't call the gateway", async () => {
            await withAccount();
            silenceLogger();
            const withdrawSpy = jest.spyOn(container.get(WITHDRAWAL_GATEWAY), "withdraw");

            await container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand(ITEM_ID, BALANCE + VALUE));

            expect(withdrawSpy).not.toHaveBeenCalled();
        });

        it("Shouldn't reserve anything", async () => {
            await withAccount();
            silenceLogger();

            await container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand(ITEM_ID, BALANCE + VALUE));

            expect((await findAccount()).getReservedAmount()).toBe(0);
        });
    });

    describe("When CSGOEmpire withdraws the item", () => {
        it("Should withdraw the item at its value", async () => {
            await withAccount();
            const withdrawSpy = jest.spyOn(container.get(WITHDRAWAL_GATEWAY), "withdraw");

            await container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            expect(withdrawSpy).toHaveBeenCalledWith(ITEM_ID, VALUE);
        });

        it("Should keep the reservation of the item's value", async () => {
            await withAccount();

            await container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            const account = await findAccount();
            expect(account.getReservedAmount()).toBe(VALUE);
            expect(account.getAvailableAmount()).toBe(BALANCE - VALUE);
        });

        it("Should publish the item withdrawn event with its trade ids", async () => {
            await withAccount();
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            const withdrawal = await container.get(WITHDRAWAL_GATEWAY).findWithdrawal(ITEM_ID);
            const [[event]] = publishSpy.mock.calls[0]!;
            expect(event).toBeInstanceOf(ItemWithdrawnEvent);
            expect(event!.payload).toEqual({
                itemId: ITEM_ID,
                accountId: ACCOUNT_ID,
                value: VALUE,
                tradeId: withdrawal!.tradeId,
                tradeOfferId: withdrawal!.tradeOfferId,
            });
        });

        it("Shouldn't withdraw an item already reserved", async () => {
            await withAccount();
            const withdrawSpy = jest.spyOn(container.get(WITHDRAWAL_GATEWAY), "withdraw");
            await container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            const withdrawing = container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            await expect(withdrawing).rejects.toThrow(ReservationAlreadyExistsError);
            expect(withdrawSpy).toHaveBeenCalledTimes(1);
        });

        it("Should keep the reservation when a step after the withdrawal fails", async () => {
            await withAccount();
            jest.spyOn(container.get(EVENT_BUS), "publish").mockRejectedValue(new Error());

            const withdrawing = container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            await expect(withdrawing).rejects.toThrow(Error);
            expect((await findAccount()).getReservedAmount()).toBe(VALUE);
        });
    });

    describe("When CSGOEmpire rejects the withdrawal", () => {
        it("Should refund the reservation", async () => {
            await withAccount();

            const withdrawing = container
                .get(WITHDRAW_ITEM_HANDLER)
                .handle(withdrawCommand(ACTIVE_WITHDRAWAL!.item_id));

            await expect(withdrawing).rejects.toThrow(WithdrawalRejectedError);
            const account = await findAccount();
            expect(account.getReservedAmount()).toBe(0);
            expect(account.getAvailableAmount()).toBe(BALANCE);
        });

        it("Shouldn't publish any event", async () => {
            await withAccount();
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            const withdrawing = container
                .get(WITHDRAW_ITEM_HANDLER)
                .handle(withdrawCommand(ACTIVE_WITHDRAWAL!.item_id));

            await expect(withdrawing).rejects.toThrow(WithdrawalRejectedError);
            expect(publishSpy).not.toHaveBeenCalled();
        });
    });

    describe("When the outcome of the withdrawal is unknown", () => {
        it("Should keep the reservation when the item was withdrawn", async () => {
            failingWith("lost-response");
            await withAccount();
            silenceLogger();

            await container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            expect((await findAccount()).getReservedAmount()).toBe(VALUE);
        });

        it("Should publish the item withdrawn event when the item was withdrawn", async () => {
            failingWith("lost-response");
            await withAccount();
            silenceLogger();
            const publishSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            const [[event]] = publishSpy.mock.calls[0]!;
            expect(event!.payload).toMatchObject({ itemId: ITEM_ID, accountId: ACCOUNT_ID, value: VALUE });
        });

        it("Should log that the item was withdrawn", async () => {
            failingWith("lost-response");
            await withAccount();
            const loggerSpy = silenceLogger();

            await container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            expect(loggerSpy).toHaveBeenCalledWith(
                `The withdrawal of item "${ITEM_ID}" for ${VALUE} was confirmed, keeping its reservation`,
            );
        });

        it("Should refund the reservation when the item wasn't withdrawn", async () => {
            failingWith("server-error");
            await withAccount();
            silenceLogger();

            const withdrawing = container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            await expect(withdrawing).rejects.toThrow(WithdrawalOutcomeUnknownError);
            expect((await findAccount()).getAvailableAmount()).toBe(BALANCE);
        });

        it("Should log the refund when the item wasn't withdrawn", async () => {
            failingWith("server-error");
            await withAccount();
            const loggerSpy = silenceLogger();

            const withdrawing = container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            await expect(withdrawing).rejects.toThrow(WithdrawalOutcomeUnknownError);
            expect(loggerSpy).toHaveBeenCalledWith(
                `The withdrawal of item "${ITEM_ID}" for ${VALUE} wasn't made, refunding its reservation`,
            );
        });

        it("Should keep the reservation and log it when the withdrawal can't be confirmed", async () => {
            failingWith("server-error");
            await withAccount();
            const loggerSpy = silenceLogger();
            jest.spyOn(container.get(WITHDRAWAL_GATEWAY), "findWithdrawal").mockRejectedValue(new Error());

            const withdrawing = container.get(WITHDRAW_ITEM_HANDLER).handle(withdrawCommand());

            await expect(withdrawing).rejects.toThrow(WithdrawalOutcomeUnknownError);
            expect((await findAccount()).getReservedAmount()).toBe(VALUE);
            expect(loggerSpy).toHaveBeenCalledWith(
                `Couldn't confirm the withdrawal of item "${ITEM_ID}" for ${VALUE}, keeping its reservation`,
            );
        });
    });
});
