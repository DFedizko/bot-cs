import type { GetActiveAuctions } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/get-active-auctions";
import type { PlaceBid } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/place-bid";
import { HttpError } from "@/packages/infrastructure/http/errors/http.error";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { CsgoempireAuctionHttpFakeAdapter } from "./csgoempire-auction.http.fake-adapter";
import { placeBidRequest } from "./__mocks__/place-bid.mock";

const AUCTION_ID = 11204;
const BID_VALUE = 230;
const USER_ID = 404220;
const UNKNOWN_DEPOSIT_ID = "999999";
const BID_ON_AUCTION = { deposit_id: String(AUCTION_ID), bid_value: BID_VALUE } satisfies PlaceBid.Request;

const findAuction = async (http: CsgoempireAuctionHttpFakeAdapter) => {
    const { active_auctions } = await http.getActiveAuctions();
    return active_auctions.find((auction) => auction.id === AUCTION_ID);
};

describe("CsgoempireAuctionHttp", () => {
    it("Should get active auctions", async () => {
        const response = await new CsgoempireAuctionHttpFakeAdapter().getActiveAuctions();

        expectTypeOf(response).toEqualTypeOf<GetActiveAuctions.Response>();
    });

    it("Should return new auctions a caller can't mutate", async () => {
        const http = new CsgoempireAuctionHttpFakeAdapter();
        const auction = await findAuction(http);
        auction!.auction_highest_bid = BID_VALUE;

        const unchanged = await findAuction(http);

        expect(unchanged?.auction_highest_bid).not.toBe(BID_VALUE);
    });

    describe("placeBid", () => {
        it("Should return the documented response", async () => {
            const response = await new CsgoempireAuctionHttpFakeAdapter().placeBid(BID_ON_AUCTION);

            expectTypeOf(response).toEqualTypeOf<PlaceBid.Response>();
        });

        it("Should make the user the highest bidder at the bid value", async () => {
            const http = new CsgoempireAuctionHttpFakeAdapter(undefined, { userId: USER_ID });

            const { auction_data } = await http.placeBid(BID_ON_AUCTION);

            expect(auction_data).toMatchObject({
                id: AUCTION_ID,
                auction_highest_bid: BID_VALUE,
                auction_highest_bidder: USER_ID,
            });
        });

        it("Should count the bid in the active auction", async () => {
            const http = new CsgoempireAuctionHttpFakeAdapter(undefined, { userId: USER_ID });
            const before = await findAuction(http);

            await http.placeBid(BID_ON_AUCTION);

            expect(await findAuction(http)).toMatchObject({
                auction_highest_bid: BID_VALUE,
                auction_highest_bidder: USER_ID,
                auction_number_of_bids: before!.auction_number_of_bids + 1,
            });
        });

        it("Should reject an unknown deposit with the documented bad request", async () => {
            const http = new CsgoempireAuctionHttpFakeAdapter();

            const placing = http.placeBid({ ...placeBidRequest, deposit_id: UNKNOWN_DEPOSIT_ID });

            await expect(placing).rejects.toMatchObject({ httpStatus: HttpStatus.BAD_REQUEST });
        });

        it("Should refuse the bid with too many requests when rate limited", async () => {
            const http = new CsgoempireAuctionHttpFakeAdapter(undefined, { bidFailure: "rate-limited" });

            const placing = http.placeBid(BID_ON_AUCTION);

            await expect(placing).rejects.toMatchObject({ httpStatus: HttpStatus.TOO_MANY_REQUESTS });
        });

        it("Shouldn't change the auction when rate limited", async () => {
            const http = new CsgoempireAuctionHttpFakeAdapter(undefined, { bidFailure: "rate-limited" });
            const before = await findAuction(http);

            await http.placeBid(BID_ON_AUCTION).catch(() => undefined);

            expect(await findAuction(http)).toEqual(before);
        });

        it("Should fail with a server error without placing the bid", async () => {
            const http = new CsgoempireAuctionHttpFakeAdapter(undefined, { bidFailure: "server-error" });
            const before = await findAuction(http);

            await expect(http.placeBid(BID_ON_AUCTION)).rejects.toBeInstanceOf(HttpError);

            expect(await findAuction(http)).toEqual(before);
        });

        it("Should place the bid but lose the response", async () => {
            const http = new CsgoempireAuctionHttpFakeAdapter(undefined, {
                userId: USER_ID,
                bidFailure: "lost-response",
            });

            await expect(http.placeBid(BID_ON_AUCTION)).rejects.toBeInstanceOf(HttpError);

            expect(await findAuction(http)).toMatchObject({
                auction_highest_bid: BID_VALUE,
                auction_highest_bidder: USER_ID,
            });
        });
    });
});
