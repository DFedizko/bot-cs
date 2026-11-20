import type { Mock } from "bun:test";
import type { Container } from "inversify";
import { biddingContainer, fakeExternals } from "./__builders__/bidding-container.builder";
import { AUCTION_GATEWAY, CSGOEMPIRE_AUCTION_HTTP } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import { AuctionGatewayDryRunAdapter } from "@/contexts/trading/bidding/infrastructure/gateways/auction.gateway.dry-run-adapter";
import type { CsgoempireAuctionHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-auction.http";
import { getSktMetafakeResponse } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";

const AUCTION_ID = 11204;
const BID_VALUE = 300;

let container: Container;
let placeBidSpy: Mock<CsgoempireAuctionHttp["placeBid"]>;

describe("BiddingDevModule", () => {
    beforeEach(() => {
        container = fakeExternals(biddingContainer("development"));
        placeBidSpy = jest.spyOn(container.get(CSGOEMPIRE_AUCTION_HTTP), "placeBid");
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should bind the dry-run auction gateway", async () => {
        const auctionGateway = await container.getAsync(AUCTION_GATEWAY);

        expect(auctionGateway).toBeInstanceOf(AuctionGatewayDryRunAdapter);
    });

    it("Should never place a bid on csgoempire", async () => {
        const auctionGateway = await container.getAsync(AUCTION_GATEWAY);

        await auctionGateway.placeBid(AUCTION_ID, BID_VALUE);

        expect(placeBidSpy).not.toHaveBeenCalled();
    });

    it("Should bid as the account of the socket metadata", async () => {
        const auctionGateway = await container.getAsync(AUCTION_GATEWAY);

        const bidPlaced = await auctionGateway.placeBid(AUCTION_ID, BID_VALUE);

        expect(bidPlaced.bidderId).toBe(getSktMetafakeResponse.user.id);
    });
});
