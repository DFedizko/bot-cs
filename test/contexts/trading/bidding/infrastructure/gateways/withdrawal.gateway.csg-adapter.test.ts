import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { CSGOEMPIRE_TRADE_HTTP, WITHDRAWAL_GATEWAY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { WithdrawalRejectedError } from "@/contexts/trading/bidding/application/withdraw-item/withdrawal-rejected.error";
import { WithdrawalOutcomeUnknownError } from "@/contexts/trading/bidding/application/withdraw-item/withdrawal-outcome-unknown.error";
import { HttpError } from "@/packages/infrastructure/http/errors/http.error";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import {
    CsgoempireTradeHttpFakeAdapter,
    type WithdrawFailure,
} from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-trade.http.fake-adapter";
import { createWithdrawalSuccess } from "@/contexts/trading/bidding/external/http/csgoempire/__mocks__/create-withdrawal.mock";
import { activeTrades } from "@/contexts/trading/bidding/external/http/csgoempire/__mocks__/active-trades.mock";

const ITEM_ID = 288767047;
const COIN_VALUE = 3656;
const [ACTIVE_WITHDRAWAL] = activeTrades.data.withdrawals;

let container: Container;

const failingWith = (withdrawFailure: WithdrawFailure): void => {
    container.rebind(CSGOEMPIRE_TRADE_HTTP).toConstantValue(new CsgoempireTradeHttpFakeAdapter({ withdrawFailure }));
};

describe("WithdrawalGatewayCsgAdapter", () => {
    beforeEach(() => {
        container = testContainer();
    });

    describe("withdraw", () => {
        it("Should return the withdrawal with its trade ids", async () => {
            jest.spyOn(container.get(CSGOEMPIRE_TRADE_HTTP), "createWithdrawal").mockResolvedValue(
                createWithdrawalSuccess,
            );

            const withdrawal = await container.get(WITHDRAWAL_GATEWAY).withdraw(ITEM_ID, COIN_VALUE);

            expect(withdrawal).toEqual({
                tradeId: createWithdrawalSuccess.data.id,
                tradeOfferId: createWithdrawalSuccess.data.tradeoffer_id,
                itemId: ITEM_ID,
                value: COIN_VALUE,
            });
        });

        it("Should withdraw the item at its value", async () => {
            const withdrawSpy = jest.spyOn(container.get(CSGOEMPIRE_TRADE_HTTP), "createWithdrawal");

            await container.get(WITHDRAWAL_GATEWAY).withdraw(ITEM_ID, COIN_VALUE);

            expect(withdrawSpy).toHaveBeenCalledWith({ deposit_id: ITEM_ID, coin_value: COIN_VALUE });
        });

        it("Should reject the withdrawal when CSGOEmpire answers a bad request", async () => {
            const withdrawing = container.get(WITHDRAWAL_GATEWAY).withdraw(ACTIVE_WITHDRAWAL!.item_id, COIN_VALUE);

            await expect(withdrawing).rejects.toBeInstanceOf(WithdrawalRejectedError);
        });

        it("Should reject the withdrawal when CSGOEmpire rate limits it", async () => {
            failingWith("rate-limited");

            const withdrawing = container.get(WITHDRAWAL_GATEWAY).withdraw(ITEM_ID, COIN_VALUE);

            await expect(withdrawing).rejects.toBeInstanceOf(WithdrawalRejectedError);
        });

        it("Should report an unknown outcome when CSGOEmpire fails with a server error", async () => {
            failingWith("server-error");

            const withdrawing = container.get(WITHDRAWAL_GATEWAY).withdraw(ITEM_ID, COIN_VALUE);

            await expect(withdrawing).rejects.toBeInstanceOf(WithdrawalOutcomeUnknownError);
        });

        it("Should report an unknown outcome when the response is lost", async () => {
            failingWith("lost-response");

            const withdrawing = container.get(WITHDRAWAL_GATEWAY).withdraw(ITEM_ID, COIN_VALUE);

            await expect(withdrawing).rejects.toBeInstanceOf(WithdrawalOutcomeUnknownError);
        });

        it("Should report an unknown outcome for an error that isn't an HTTP answer", async () => {
            jest.spyOn(container.get(CSGOEMPIRE_TRADE_HTTP), "createWithdrawal").mockRejectedValue(new Error());

            const withdrawing = container.get(WITHDRAWAL_GATEWAY).withdraw(ITEM_ID, COIN_VALUE);

            await expect(withdrawing).rejects.toBeInstanceOf(WithdrawalOutcomeUnknownError);
        });

        it("Should report an unknown outcome for an undocumented client error", async () => {
            jest.spyOn(container.get(CSGOEMPIRE_TRADE_HTTP), "createWithdrawal").mockRejectedValue(
                new HttpError({ status: HttpStatus.CONFLICT }),
            );

            const withdrawing = container.get(WITHDRAWAL_GATEWAY).withdraw(ITEM_ID, COIN_VALUE);

            await expect(withdrawing).rejects.toBeInstanceOf(WithdrawalOutcomeUnknownError);
        });
    });

    describe("findWithdrawal", () => {
        it("Should find the active withdrawal of the item", async () => {
            const withdrawal = await container.get(WITHDRAWAL_GATEWAY).findWithdrawal(ACTIVE_WITHDRAWAL!.item_id);

            expect(withdrawal).toEqual({
                tradeId: ACTIVE_WITHDRAWAL!.id,
                tradeOfferId: ACTIVE_WITHDRAWAL!.tradeoffer_id,
                itemId: ACTIVE_WITHDRAWAL!.item_id,
                value: ACTIVE_WITHDRAWAL!.total_value,
            });
        });

        it("Should find nothing for an item that wasn't withdrawn", async () => {
            const withdrawal = await container.get(WITHDRAWAL_GATEWAY).findWithdrawal(ITEM_ID);

            expect(withdrawal).toBeUndefined();
        });
    });
});
