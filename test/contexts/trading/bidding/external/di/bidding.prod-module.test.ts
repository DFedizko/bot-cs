import type { Container } from "inversify";
import { biddingContainer } from "./__builders__/bidding-container.builder";
import { fakeExternals } from "@/__builders__/externals.builder";
import { AUCTION_GATEWAY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { AuctionGatewayCsgoempireAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.csgoempire-adapter";

let container: Container;

describe("BiddingProdModule", () => {
    beforeEach(() => {
        container = fakeExternals(biddingContainer("production"));
    });

    it("Should bind the csgoempire auction gateway that places real bids", async () => {
        const auctionGateway = await container.getAsync(AUCTION_GATEWAY);

        expect(auctionGateway).toBeInstanceOf(AuctionGatewayCsgoempireAdapter);
    });
});
