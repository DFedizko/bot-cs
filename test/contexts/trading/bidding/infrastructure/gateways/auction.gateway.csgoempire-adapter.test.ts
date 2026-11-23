import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { AUCTION_GATEWAY, CSGOEMPIRE_AUCTION_HTTP } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { BidRejectedError } from "@/contexts/trading/bidding/application/place-bid/bid-rejected.error";
import { BidOutcomeUnknownError } from "@/contexts/trading/bidding/application/place-bid/bid-outcome-unknown.error";
import {
    CsgoempireAuctionHttpFakeAdapter,
    type PlaceBidFailure,
} from "@/contexts/trading/bidding/external/http/csgoempire/csgoempire-auction.http.fake-adapter";

const AUCTION_ID = 11204;
const UNKNOWN_AUCTION_ID = 999999;
const BID_VALUE = 230;
const USER_ID = 404220;

let container: Container;

const failingWith = (bidFailure: PlaceBidFailure): void => {
    container
        .rebind(CSGOEMPIRE_AUCTION_HTTP)
        .toConstantValue(new CsgoempireAuctionHttpFakeAdapter(undefined, { bidFailure }));
};

describe("AuctionGatewayCsgoempireAdapter", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should return the auction with the placed bid", async () => {
        container
            .rebind(CSGOEMPIRE_AUCTION_HTTP)
            .toConstantValue(new CsgoempireAuctionHttpFakeAdapter(undefined, { userId: USER_ID }));

        const auction = await container.get(AUCTION_GATEWAY).placeBid(AUCTION_ID, BID_VALUE);

        expect(auction).toMatchObject({ id: AUCTION_ID, highestBid: BID_VALUE, bidderId: USER_ID });
    });

    it("Should reject the bid when CSGOEmpire answers a bad request", async () => {
        const placing = container.get(AUCTION_GATEWAY).placeBid(UNKNOWN_AUCTION_ID, BID_VALUE);

        await expect(placing).rejects.toBeInstanceOf(BidRejectedError);
    });

    it("Should reject the bid when CSGOEmpire rate limits it", async () => {
        failingWith("rate-limited");

        const placing = container.get(AUCTION_GATEWAY).placeBid(AUCTION_ID, BID_VALUE);

        await expect(placing).rejects.toBeInstanceOf(BidRejectedError);
    });

    it("Should report an unknown outcome when CSGOEmpire fails with a server error", async () => {
        failingWith("server-error");

        const placing = container.get(AUCTION_GATEWAY).placeBid(AUCTION_ID, BID_VALUE);

        await expect(placing).rejects.toBeInstanceOf(BidOutcomeUnknownError);
    });

    it("Should report an unknown outcome when the response is lost", async () => {
        failingWith("lost-response");

        const placing = container.get(AUCTION_GATEWAY).placeBid(AUCTION_ID, BID_VALUE);

        await expect(placing).rejects.toBeInstanceOf(BidOutcomeUnknownError);
    });

    it("Should report an unknown outcome for an error that isn't an HTTP answer", async () => {
        jest.spyOn(container.get(CSGOEMPIRE_AUCTION_HTTP), "placeBid").mockRejectedValue(new Error());

        const placing = container.get(AUCTION_GATEWAY).placeBid(AUCTION_ID, BID_VALUE);

        await expect(placing).rejects.toBeInstanceOf(BidOutcomeUnknownError);
    });
});
