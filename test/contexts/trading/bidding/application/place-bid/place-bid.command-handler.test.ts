import type { Container } from "inversify";
import { PlaceBidCommand } from "@/contexts/trading/bidding/application/place-bid/place-bid.command";
import { BidPlacedEvent } from "@/contexts/trading/bidding/application/place-bid/bid-placed.event";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    ACCOUNT_REPOSITORY,
    AUCTION_GATEWAY,
    AUCTION_PARTICIPATION_REPO,
    PLACE_BID_HANDLER,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { AccountNotFoundError } from "@/contexts/trading/bidding/domain/account/errors/account-not-found.error";
import { AuctionParticipation } from "@/contexts/trading/bidding/domain/auction-participation/auction-participation";
import { ReservationAlreadyExistsError } from "@/contexts/trading/bidding/domain/account/errors/reservation-already-exists.error";
import { BidRejectedError } from "@/contexts/trading/bidding/application/place-bid/bid-rejected.error";
import { BidOutcomeUnknownError } from "@/contexts/trading/bidding/application/place-bid/bid-outcome-unknown.error";
import {
    CsgoempireAuctionHttpFakeAdapter,
    type PlaceBidFailure,
} from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.fake-adapter";
import { CSGOEMPIRE_AUCTION_HTTP } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ACCOUNT_ID = 404220;
const AUCTION_ID = 11204;
const UNKNOWN_AUCTION_ID = 999999;
const BALANCE = 500;
const BID_VALUE = 230;
const MAX_BID = 250;

const bidCommand = (auctionId = AUCTION_ID) =>
    new PlaceBidCommand({ auctionId, accountId: ACCOUNT_ID, bidValue: BID_VALUE, maxBid: MAX_BID });

const withAccount = async (): Promise<void> => {
    await container
        .get(ACCOUNT_REPOSITORY)
        .save(Account.sync({ id: ACCOUNT_ID, name: "John Doe", totalAmount: BALANCE }));
};

const failingWith = (bidFailure: PlaceBidFailure): void => {
    container
        .rebind(CSGOEMPIRE_AUCTION_HTTP)
        .toConstantValue(new CsgoempireAuctionHttpFakeAdapter(undefined, { userId: ACCOUNT_ID, bidFailure }));
};

const findAccount = async (): Promise<Account> =>
    (await container.get(ACCOUNT_REPOSITORY).findById(new AccountId(ACCOUNT_ID))) as Account;

let container: Container;

beforeEach(() => {
    container = testContainer();
});

describe("PlaceBidCommandHandler", () => {
    it("Should place a bid and publish bid placed event", async () => {
        const accountRepository = container.get(ACCOUNT_REPOSITORY);
        const auctionParticipationRepo = container.get(AUCTION_PARTICIPATION_REPO);
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 227 }));
        const auctionParticipationSaveSpy = jest.spyOn(auctionParticipationRepo, "save");
        const placeBidSpy = jest.spyOn(container.get(AUCTION_GATEWAY), "placeBid");
        const publishEventSpy = jest.spyOn(container.get(EVENT_BUS), "publish");
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227, maxBid: 230 });

        await container.get(PLACE_BID_HANDLER).handle(placeBidCommand);

        const auctionParticipation = await auctionParticipationRepo.findByAuctionId(
            new AccountId(placeBidCommand.auctionId),
        );
        const account = (await accountRepository.findById(new AccountId(1))) as Account;
        const [[event]] = publishEventSpy.mock.calls[0];
        expect(placeBidSpy).toHaveBeenCalledTimes(1);
        expect(placeBidSpy).toHaveBeenCalledWith(11204, 227);
        expect(auctionParticipationSaveSpy).toHaveBeenCalledTimes(1);
        expect(auctionParticipation).toMatchObject(
            AuctionParticipation.create({
                auctionId: placeBidCommand.auctionId,
                accountId: placeBidCommand.accountId,
                maxBid: placeBidCommand.maxBid!,
            }),
        );
        expect(account.getTotalAmount()).toBe(227);
        expect(account.getReservedAmount()).toBe(227);
        expect(account.getAvailableAmount()).toBe(0);
        expect(publishEventSpy).toHaveBeenCalledTimes(1);
        expect(event.name).toBe(BidPlacedEvent.EVENT_NAME);
        expect(event.payload).toMatchObject({ auctionId: 11204, accountId: 1, bidValue: 227, bidderId: 303119 });
    });
    it("Shouldn't create another auction participation when placing a bid, and it's already there", async () => {
        const auctionParticipationRepo = container.get(AUCTION_PARTICIPATION_REPO);
        const auctionParticipationSaveSpy = jest.spyOn(auctionParticipationRepo, "save");
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227, maxBid: 230 });
        await container.get(ACCOUNT_REPOSITORY).save(Account.sync({ id: 1, name: "John Doe", totalAmount: 227 }));
        await auctionParticipationRepo.save(
            AuctionParticipation.create({
                auctionId: placeBidCommand.auctionId,
                accountId: 1,
                maxBid: placeBidCommand.maxBid!,
            }),
        );

        await container.get(PLACE_BID_HANDLER).handle(placeBidCommand);

        expect(auctionParticipationSaveSpy).toHaveBeenCalledTimes(1);
    });
    it("Shouldn't place a bid and log if the account hasn't sufficient balance", async () => {
        const accountRepository = container.get(ACCOUNT_REPOSITORY);
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 9999 }));
        const loggerSpy = jest.spyOn(container.get(LOGGER), "log");
        const placeBidSpy = jest.spyOn(container.get(AUCTION_GATEWAY), "placeBid");
        const publishEventSpy = jest.spyOn(container.get(EVENT_BUS), "publish");
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 10000, maxBid: 10100 });

        await container.get(PLACE_BID_HANDLER).handle(placeBidCommand);

        const auctionParticipation = await container
            .get(AUCTION_PARTICIPATION_REPO)
            .findByAuctionId(new AccountId(placeBidCommand.auctionId));
        const account = (await accountRepository.findById(new AccountId(1))) as Account;
        expect(loggerSpy).toHaveBeenCalledWith(
            `Couldn't place bid on auction "11204" because the "John Doe" account has insufficient balance`,
        );
        expect(placeBidSpy).not.toHaveBeenCalled();
        expect(publishEventSpy).not.toHaveBeenCalled();
        expect(auctionParticipation).toBe(undefined);
        expect(account.getTotalAmount()).toBe(9999);
        expect(account.getReservedAmount()).toBe(0);
        expect(account.getAvailableAmount()).toBe(9999);
    });
    it("Should throw an error when account not found by the id", async () => {
        const handler = container.get(PLACE_BID_HANDLER);
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227, maxBid: 231 });

        await expect(handler.handle(placeBidCommand)).rejects.toThrow(AccountNotFoundError);
    });
    it("Shouldn't call the gateway when a dispatch a second command for an auction that's already reserved", async () => {
        await container.get(ACCOUNT_REPOSITORY).save(Account.sync({ id: 1, name: "John Doe", totalAmount: 459 }));
        const placeBidSpy = jest.spyOn(container.get(AUCTION_GATEWAY), "placeBid");
        const handler = container.get(PLACE_BID_HANDLER);
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227, maxBid: 230 });
        await handler.handle(placeBidCommand);

        await expect(handler.handle(placeBidCommand)).rejects.toThrow(ReservationAlreadyExistsError);

        expect(placeBidSpy).toHaveBeenCalledTimes(1);
    });

    describe("When CSGOEmpire rejects the bid", () => {
        it("Should refund the reservation", async () => {
            await withAccount();

            await expect(container.get(PLACE_BID_HANDLER).handle(bidCommand(UNKNOWN_AUCTION_ID))).rejects.toThrow(
                BidRejectedError,
            );

            const account = await findAccount();
            expect(account.getReservedAmount()).toBe(0);
            expect(account.getAvailableAmount()).toBe(BALANCE);
        });

        it("Shouldn't create an auction participation", async () => {
            await withAccount();

            await expect(container.get(PLACE_BID_HANDLER).handle(bidCommand(UNKNOWN_AUCTION_ID))).rejects.toThrow(
                BidRejectedError,
            );

            const participation = await container
                .get(AUCTION_PARTICIPATION_REPO)
                .findByAuctionId(new AccountId(UNKNOWN_AUCTION_ID));
            expect(participation).toBe(undefined);
        });
    });

    describe("When the outcome of the bid is unknown", () => {
        it("Should keep the reservation when the bid went through", async () => {
            failingWith("lost-response");
            await withAccount();
            jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

            await container.get(PLACE_BID_HANDLER).handle(bidCommand());

            const account = await findAccount();
            expect(account.getReservedAmount()).toBe(BID_VALUE);
            expect(account.getAvailableAmount()).toBe(BALANCE - BID_VALUE);
        });

        it("Should publish the bid placed event when the bid went through", async () => {
            failingWith("lost-response");
            await withAccount();
            jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
            const publishEventSpy = jest.spyOn(container.get(EVENT_BUS), "publish");

            await container.get(PLACE_BID_HANDLER).handle(bidCommand());

            const [[event]] = publishEventSpy.mock.calls[0];
            expect(event.payload).toMatchObject({ auctionId: AUCTION_ID, bidValue: BID_VALUE, bidderId: ACCOUNT_ID });
        });

        it("Should log that the bid went through", async () => {
            failingWith("lost-response");
            await withAccount();
            const loggerSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

            await container.get(PLACE_BID_HANDLER).handle(bidCommand());

            expect(loggerSpy).toHaveBeenCalledWith(
                `The bid of ${BID_VALUE} on auction "${AUCTION_ID}" was confirmed as placed, keeping its reservation`,
            );
        });

        it("Should refund the reservation when the bid isn't there", async () => {
            failingWith("server-error");
            await withAccount();
            jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

            await expect(container.get(PLACE_BID_HANDLER).handle(bidCommand())).rejects.toThrow(BidOutcomeUnknownError);

            const account = await findAccount();
            expect(account.getReservedAmount()).toBe(0);
            expect(account.getAvailableAmount()).toBe(BALANCE);
        });

        it("Should log the refund when the bid isn't there", async () => {
            failingWith("server-error");
            await withAccount();
            const loggerSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

            await expect(container.get(PLACE_BID_HANDLER).handle(bidCommand())).rejects.toThrow(BidOutcomeUnknownError);

            expect(loggerSpy).toHaveBeenCalledWith(
                `The bid of ${BID_VALUE} on auction "${AUCTION_ID}" wasn't placed, refunding its reservation`,
            );
        });

        it("Should keep the reservation when the bid can't be confirmed", async () => {
            failingWith("server-error");
            await withAccount();
            jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
            jest.spyOn(container.get(AUCTION_GATEWAY), "getActiveAuctions").mockRejectedValue(new Error());

            await expect(container.get(PLACE_BID_HANDLER).handle(bidCommand())).rejects.toThrow(BidOutcomeUnknownError);

            expect((await findAccount()).getReservedAmount()).toBe(BID_VALUE);
        });

        it("Should log the kept reservation when the bid can't be confirmed", async () => {
            failingWith("server-error");
            await withAccount();
            const loggerSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
            jest.spyOn(container.get(AUCTION_GATEWAY), "getActiveAuctions").mockRejectedValue(new Error());

            await expect(container.get(PLACE_BID_HANDLER).handle(bidCommand())).rejects.toThrow(BidOutcomeUnknownError);

            expect(loggerSpy).toHaveBeenCalledWith(
                `Couldn't confirm the bid of ${BID_VALUE} on auction "${AUCTION_ID}", keeping its reservation`,
            );
        });
    });

    it("Should keep the reservation when a step after the placed bid fails", async () => {
        await withAccount();
        jest.spyOn(container.get(EVENT_BUS), "publish").mockRejectedValue(new Error());

        await expect(container.get(PLACE_BID_HANDLER).handle(bidCommand())).rejects.toThrow(Error);

        expect((await findAccount()).getReservedAmount()).toBe(BID_VALUE);
    });
});
