import { PlaceBidCommand } from "@/contexts/trading/bidding/application/place-bid/place-bid.command";
import { BidPlacedEvent } from "@/contexts/trading/bidding/application/place-bid/bid-placed.event";
import type { AuctionGateway } from "@/contexts/trading/bidding/application/place-bid/auction.gateway";
import { testContainer } from "@/__builders__/test-container.builder";
import { EVENT_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    ACCOUNT_REPOSITORY,
    AUCTION_GATEWAY,
    AUCTION_PARTICIPATION_REPO,
    PLACE_BID_HANDLER,
} from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import type { EventBus } from "@/packages/application/event-bus";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { Mock } from "bun:test";
import type { AccountRepository } from "@/contexts/trading/bidding/application/account.repository";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { InsufficientBalanceError } from "@/contexts/trading/bidding/domain/account/errors/insufficient-balance.error";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import type { Logger } from "@/packages/application/logger";
import type { AuctionParticipationRepository } from "@/contexts/trading/bidding/application/auction-participation.repository";
import { AuctionParticipation } from "@/contexts/trading/bidding/domain/auction-participation/auction-participation";
import { ReservationAlreadyExistsError } from "@/contexts/trading/bidding/domain/account/errors/reservation-already-exists.error";

let accountRepository: AccountRepository;
let auctionParticipationRepo: AuctionParticipationRepository;
let auctionParticipationSaveSpy: Mock<AuctionParticipationRepository["save"]>;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let auctionGateway: AuctionGateway;
let eventBus: EventBus;
let handler: CommandHandler<PlaceBidCommand>;
let placeBidSpy: Mock<AuctionGateway["placeBid"]>;
let publishEventSpy: Mock<EventBus["publish"]>;
beforeEach(async () => {
    const container = testContainer();
    accountRepository = container.get(ACCOUNT_REPOSITORY);
    auctionParticipationRepo = container.get(AUCTION_PARTICIPATION_REPO);
    auctionParticipationSaveSpy = jest.spyOn(auctionParticipationRepo, "save");
    logger = container.get(LOGGER);
    loggerSpy = jest.spyOn(logger, "log");
    auctionGateway = container.get(AUCTION_GATEWAY);
    eventBus = container.get(EVENT_BUS);
    handler = container.get(PLACE_BID_HANDLER);
    placeBidSpy = jest.spyOn(auctionGateway, "placeBid");
    publishEventSpy = jest.spyOn(eventBus, "publish");
});

describe("PlaceBidCommandHandler", () => {
    it("Should place a bid and publish bid placed event", async () => {
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 227 }));
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227, maxBid: 230 });
        await handler.handle(placeBidCommand);
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
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227, maxBid: 230 });
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 227 }));
        await auctionParticipationRepo.save(
            AuctionParticipation.create({
                auctionId: placeBidCommand.auctionId,
                accountId: 1,
                maxBid: placeBidCommand.maxBid!,
            }),
        );
        await handler.handle(placeBidCommand);
        expect(auctionParticipationSaveSpy).toHaveBeenCalledTimes(1);
    });
    it("Shouldn't place a bid and log if the account hasn't sufficient balance", async () => {
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 9999 }));
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 10000, maxBid: 10100 });
        await handler.handle(placeBidCommand);
        const auctionParticipation = await auctionParticipationRepo.findByAuctionId(
            new AccountId(placeBidCommand.auctionId),
        );
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
    it("Should refund an amount in the account balance and remove auction participation when auction gateway throw an error", async () => {
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 227 }));
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227, maxBid: 231 });
        placeBidSpy.mockRejectedValue(new Error());
        const auctionParticipation = await auctionParticipationRepo.findByAuctionId(
            new AccountId(placeBidCommand.auctionId),
        );
        const account = await accountRepository.findById(new AccountId(1));
        expect(async () => await handler.handle(placeBidCommand)).toThrow(Error);
        expect(auctionParticipation).toBe(undefined);
        expect(account?.getReservedAmount()).toBe(0);
        expect(account?.getAvailableAmount()).toBe(227);
    });
    it("Should throw an error when account not found by the id", () => {
        expect(
            async () =>
                await handler.handle(
                    new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227, maxBid: 231 }),
                ),
        ).toThrow(NotFoundError);
    });
    it("Shouldn't call the gateway when a dispatch a second command for an auction that's already reserved", async () => {
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 459 }));
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227, maxBid: 230 });
        await handler.handle(placeBidCommand);
        expect(async () => await handler.handle(placeBidCommand)).toThrow(ReservationAlreadyExistsError);
        expect(placeBidSpy).toHaveBeenCalledTimes(1);
    });
});
