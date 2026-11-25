import type { Container } from "inversify";
import { biddingContainer } from "./__builders__/bidding-container.builder";
import { fakeExternals } from "@/__builders__/externals.builder";
import { AUCTION_GATEWAY, WITHDRAWAL_GATEWAY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { EVENT_LISTENER } from "@/packages/external/di/packages.identifiers";
import { WithdrawalGatewayCsgAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/withdrawal.gateway.csg-adapter";
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

    it("Should bind the csgoempire withdrawal gateway that withdraws real items", async () => {
        const withdrawalGateway = await container.getAsync(WITHDRAWAL_GATEWAY);

        expect(withdrawalGateway).toBeInstanceOf(WithdrawalGatewayCsgAdapter);
    });

    it("Should not subscribe any bidding event listener until real bidding is enabled", async () => {
        const listeners = await container.getAllAsync(EVENT_LISTENER, { optional: true });

        expect(listeners).toEqual([]);
    });
});
