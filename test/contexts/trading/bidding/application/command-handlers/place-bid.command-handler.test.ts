import { PlaceBidCommandHandler } from "@/contexts/trading/bidding/application/command-handlers/place-bid.command-handler";
import { PlaceBidCommand } from "@/contexts/trading/bidding/application/commands/place-bid.command";
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
beforeEach(() => {
    csgoempireAuctionHttp = new CsgoempireAuctionHttpFakeAdapter();
    auctionGateway = new AuctionGatewayCsgoempireAdapter(csgoempireAuctionHttp);
    eventBus = new EventBusInMemoryAsync();
    handler = new PlaceBidCommandHandler(auctionGateway, eventBus);
    placeBidSpy = jest.spyOn(auctionGateway, "placeBid");
});

describe("PlaceBidCommandHandler", () => {
    it("Should place a bid", async () => {
        const placeBidCommand = new PlaceBidCommand({ depositId: 1, bidValue: 10000 });
        await handler.handle(placeBidCommand);
        expect(placeBidSpy).toHaveBeenCalledTimes(1);
        expect(placeBidSpy).toHaveBeenCalledWith("1", 10000);
    });
});
