import { PlaceBidCommandHandler } from "@/contexts/trading/bidding/application/place-bid/place-bid.command-handler";
import { PlaceBidCommand } from "@/contexts/trading/bidding/application/place-bid/place-bid.command";
import { BidPlacedEvent } from "@/contexts/trading/bidding/application/place-bid/bid-placed.event";
import type { AuctionGateway } from "@/contexts/trading/bidding/application/place-bid/auction.gateway";
import type { AccountBalanceStore } from "@/contexts/trading/bidding/application/account-balance.store";
import { CsgoempireAuctionHttpFakeAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.fake-adapter";
import { AuctionGatewayCsgoempireAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.csgoempire-adapter";
import type { CsgoempireAuctionHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-auction.http";
import { AccountBalanceStoreInMemory } from "@/contexts/trading/bidding/infrastructure/stores/account-balance.store.in-memory";
import type { EventBus } from "@/packages/application/event-bus";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { EventBusInMemoryAsync } from "@/packages/external/event-bus/event-bus.in-memory-async";
import type { Mock } from "bun:test";

let accountBalance: AccountBalanceStore;
let csgoempireAuctionHttp: CsgoempireAuctionHttp;
let auctionGateway: AuctionGateway;
let eventBus: EventBus;
let handler: CommandHandler<PlaceBidCommand>;
let placeBidSpy: Mock<AuctionGateway["placeBid"]>;
let publishEventSpy: Mock<EventBus["publish"]>;
beforeEach(() => {
    accountBalance = new AccountBalanceStoreInMemory();
    csgoempireAuctionHttp = new CsgoempireAuctionHttpFakeAdapter();
    auctionGateway = new AuctionGatewayCsgoempireAdapter(csgoempireAuctionHttp);
    eventBus = new EventBusInMemoryAsync();
    handler = new PlaceBidCommandHandler(accountBalance, auctionGateway, eventBus);
    placeBidSpy = jest.spyOn(auctionGateway, "placeBid");
    publishEventSpy = jest.spyOn(eventBus, "publish");
});

describe("PlaceBidCommandHandler", () => {
    it("Should place a bid and publish bid placed event", async () => {
        accountBalance.credit(227);
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, bidValue: 227 });
        await handler.handle(placeBidCommand);
        const [[event]] = publishEventSpy.mock.calls[0];
        expect(placeBidSpy).toHaveBeenCalledTimes(1);
        expect(placeBidSpy).toHaveBeenCalledWith(11204, 227);
        expect(accountBalance.getBalance().getTotal()).toBe(227);
        expect(accountBalance.getBalance().getReserved()).toBe(227);
        expect(accountBalance.getBalance().getAvailable()).toBe(0);
        expect(publishEventSpy).toHaveBeenCalledTimes(1);
        expect(event.name).toBe(BidPlacedEvent.EVENT_NAME);
        expect(event.payload).toMatchObject({ auctionId: 11204, bidValue: 227, bidderId: 303119 });
    });
    it("Shouldn't place a bid if the user hasn't sufficient balance", async () => {
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, bidValue: 10000 });
        await handler.handle(placeBidCommand);
        expect(placeBidSpy).not.toHaveBeenCalled();
        expect(publishEventSpy).not.toHaveBeenCalled();
        expect(accountBalance.getBalance().getTotal()).toBe(0);
        expect(accountBalance.getBalance().getReserved()).toBe(0);
        expect(accountBalance.getBalance().getAvailable()).toBe(0);
    });
    it("Should refund an amount in the account balance when auction gateway throw an error", () => {
        accountBalance.credit(227);
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, bidValue: 227 });
        placeBidSpy.mockRejectedValue(new Error());
        expect(async () => {
            const errorPromise = handler.handle(placeBidCommand);
            expect(accountBalance.getBalance().getReserved()).toBe(227);
            expect(accountBalance.getBalance().getAvailable()).toBe(0);
            return await errorPromise;
        }).toThrow(Error);
        expect(accountBalance.getBalance().getReserved()).toBe(0);
        expect(accountBalance.getBalance().getAvailable()).toBe(227);
    });
});
