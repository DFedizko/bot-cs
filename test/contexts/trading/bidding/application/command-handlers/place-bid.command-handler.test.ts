import { PlaceBidCommandHandler } from "@/contexts/trading/bidding/application/command-handlers/place-bid.command-handler";
import { PlaceBidCommand } from "@/contexts/trading/bidding/application/commands/place-bid.command";
import { BidPlacedEvent } from "@/contexts/trading/bidding/application/events/bid-placed.event";
import { AuctionGateway } from "@/contexts/trading/bidding/application/gateways/auction.gateway";
import { CsgoempireAuctionHttpFakeAdapter } from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.fake-adapter";
import { AuctionGatewayCsgoempireAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.csgoempire-adapter";
import { CsgoempireAuctionHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-auction.http";
import type { EventBus } from "@/shared/application/event-bus";
import type { CommandHandler } from "@/shared/building-blocks/command-handler";
import { EventBusInMemoryAsync } from "@/shared/external/event-bus/event-bus.in-memory-async";
import type { Mock } from "bun:test";

let csgoempireAuctionHttp: CsgoempireAuctionHttp;
let auctionGateway: AuctionGateway;
let eventBus: EventBus;
let handler: CommandHandler<PlaceBidCommand>;
let placeBidSpy: Mock<AuctionGateway["placeBid"]>;
let publishEventSpy: Mock<EventBus["publish"]>;
beforeEach(() => {
    csgoempireAuctionHttp = new CsgoempireAuctionHttpFakeAdapter();
    auctionGateway = new AuctionGatewayCsgoempireAdapter(csgoempireAuctionHttp);
    eventBus = new EventBusInMemoryAsync();
    handler = new PlaceBidCommandHandler(auctionGateway, eventBus);
    placeBidSpy = jest.spyOn(auctionGateway, "placeBid");
    publishEventSpy = jest.spyOn(eventBus, "publish");
});

describe("PlaceBidCommandHandler", () => {
    it("Should place a bid and publish bid placed event", async () => {
        const placeBidCommand = new PlaceBidCommand({ auctionId: 11204, bidValue: 10000 });
        await handler.handle(placeBidCommand);
        const [[event]] = publishEventSpy.mock.calls[0];
        expect(placeBidSpy).toHaveBeenCalledTimes(1);
        expect(placeBidSpy).toHaveBeenCalledWith(11204, 10000);
        expect(publishEventSpy).toHaveBeenCalledTimes(1);
        expect(event.name).toBe(BidPlacedEvent.EVENT_NAME);
        expect(event.payload).toMatchObject({ auctionId: 11204, bidValue: 10000, bidderId: 303119 });
    });
});
