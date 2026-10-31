import { PlaceBidCommandHandler } from "@/contexts/trading/bidding/application/place-bid/place-bid.command-handler";
import { PlaceBidCommand } from "@/contexts/trading/bidding/application/place-bid/place-bid.command";
import { BidPlacedEvent } from "@/contexts/trading/bidding/application/place-bid/bid-placed.event";
import type { AuctionGateway } from "@/contexts/trading/bidding/application/place-bid/auction.gateway";
import { CsgoempireAuctionHttpFakeAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.fake-adapter";
import { AuctionGatewayCsgoempireAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.csgoempire-adapter";
import type { CsgoempireAuctionHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-auction.http";
import type { EventBus } from "@/packages/application/event-bus";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { EventBusInMemoryAsync } from "@/packages/external/event-bus/event-bus.in-memory-async";
import type { Mock } from "bun:test";
import type { AccountRepository } from "@/contexts/trading/bidding/application/account.repository";
import { AccountRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/account.repository.in-memory";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { InsufficientBalanceError } from "@/contexts/trading/bidding/domain/account/errors/insufficient-balance.error";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import type { Logger } from "@/packages/application/logger";
import { LoggerConsoleAdapter } from "@/packages/infrastructure/logger/logger.console-adapter";

let accountRepository: AccountRepository;
let logger: Logger;
let loggerSpy: Mock<Logger["log"]>;
let csgoempireAuctionHttp: CsgoempireAuctionHttp;
let auctionGateway: AuctionGateway;
let eventBus: EventBus;
let handler: CommandHandler<PlaceBidCommand>;
let placeBidSpy: Mock<AuctionGateway["placeBid"]>;
let publishEventSpy: Mock<EventBus["publish"]>;
beforeEach(async () => {
    accountRepository = new AccountRepositoryInMemory();
    logger = new LoggerConsoleAdapter();
    loggerSpy = jest.spyOn(logger, "log");
    csgoempireAuctionHttp = new CsgoempireAuctionHttpFakeAdapter();
    auctionGateway = new AuctionGatewayCsgoempireAdapter(csgoempireAuctionHttp);
    eventBus = new EventBusInMemoryAsync();
    handler = new PlaceBidCommandHandler(accountRepository, logger, auctionGateway, eventBus);
    placeBidSpy = jest.spyOn(auctionGateway, "placeBid");
    publishEventSpy = jest.spyOn(eventBus, "publish");
});

describe("PlaceBidCommandHandler", () => {
    it("Should place a bid and publish bid placed event", async () => {
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 227 }));
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227 });
        await handler.handle(placeBidCommand);
        const account = (await accountRepository.findById(new AccountId(1))) as Account;
        const [[event]] = publishEventSpy.mock.calls[0];
        expect(placeBidSpy).toHaveBeenCalledTimes(1);
        expect(placeBidSpy).toHaveBeenCalledWith(11204, 227);
        expect(account.getTotalAmount()).toBe(227);
        expect(account.getReservedAmount()).toBe(227);
        expect(account.getAvailableAmount()).toBe(0);
        expect(publishEventSpy).toHaveBeenCalledTimes(1);
        expect(event.name).toBe(BidPlacedEvent.EVENT_NAME);
        expect(event.payload).toMatchObject({ auctionId: 11204, bidValue: 227, bidderId: 303119 });
    });
    it("Shouldn't place a bid and log if the account hasn't sufficient balance", async () => {
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 9999 }));
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 10000 });
        await handler.handle(placeBidCommand);
        const account = (await accountRepository.findById(new AccountId(1))) as Account;
        expect(loggerSpy).toHaveBeenCalledWith(
            `Couldn't place bid on auction "11204" because the "John Doe" account has insufficient balance`,
        );
        expect(placeBidSpy).not.toHaveBeenCalled();
        expect(publishEventSpy).not.toHaveBeenCalled();
        expect(account.getTotalAmount()).toBe(9999);
        expect(account.getReservedAmount()).toBe(0);
        expect(account.getAvailableAmount()).toBe(9999);
    });
    it("Should refund an amount in the account balance when auction gateway throw an error", async () => {
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 227 }));
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227 });
        placeBidSpy.mockRejectedValue(new Error());
        const account = await accountRepository.findById(new AccountId(1));
        expect(async () => await handler.handle(placeBidCommand)).toThrow(Error);
        expect(account?.getReservedAmount()).toBe(0);
        expect(account?.getAvailableAmount()).toBe(227);
    });
    it("Should throw an error when account not found by the id", () => {
        expect(
            async () => await handler.handle(new PlaceBidCommand({ auctionId: 11204, accountId: 1, bidValue: 227 })),
        ).toThrow(NotFoundError);
    });
});
