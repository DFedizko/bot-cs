// Docs: https://docs.csgoempire.com/reference/place-bid.md (400 body "{}") and
// getting-started-with-your-api.md (429 when rate limited), checked 2026-11-22.
import { auctions } from "./__mocks__/auctions.mock";
import { invoice, placeBidBadRequest } from "./__mocks__/place-bid.mock";
import { CS_APP_ID } from "@/contexts/shared-kernel/domain/cs-app-id";
import { HttpError } from "@/packages/infrastructure/http/errors/http.error";
import { InternalServerError } from "@/packages/infrastructure/http/errors/internal-server.error";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import type { CsgoempireAuctionHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-auction.http";
import type {
    ActiveAuction,
    GetActiveAuctions,
} from "@/contexts/trading/bidding/infrastructure/http/csgoempire/get-active-auctions";
import type { PlaceBid } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/place-bid";

export type PlaceBidFailure = "rate-limited" | "server-error" | "lost-response";

type PlaceBidScenario = { userId?: number; bidFailure?: PlaceBidFailure };

const ONE_BID = 1;
const LOST_RESPONSE_MESSAGE = "socket hang up";

export class CsgoempireAuctionHttpFakeAdapter implements CsgoempireAuctionHttp {
    private readonly store: ActiveAuction[];
    private readonly userId: number;

    constructor(
        allHighestBidderIds?: number,
        private readonly scenario: PlaceBidScenario = {},
    ) {
        this.userId = scenario.userId ?? invoice.user_id;
        this.store = auctions.active_auctions.map((auction) => ({
            ...structuredClone(auction),
            ...(allHighestBidderIds && { auction_highest_bidder: allHighestBidderIds }),
        }));
    }

    async getActiveAuctions(): Promise<GetActiveAuctions.Response> {
        return { success: true, active_auctions: structuredClone(this.store) };
    }

    async placeBid(request: PlaceBid.Request): Promise<PlaceBid.Response> {
        this.refuseBeforePlacing();
        const auction = this.store.find((stored) => stored.id === Number(request.deposit_id));
        if (!auction) throw this.badRequest();
        this.applyBid(auction, request.bid_value);
        if (this.scenario.bidFailure === "lost-response") throw new HttpError({ message: LOST_RESPONSE_MESSAGE });
        return this.placedBidResponse(auction, request.bid_value);
    }

    private refuseBeforePlacing(): void {
        if (this.scenario.bidFailure === "rate-limited")
            throw new HttpError({ code: "TOO_MANY_REQUESTS", status: HttpStatus.TOO_MANY_REQUESTS });
        if (this.scenario.bidFailure === "server-error") throw new InternalServerError();
    }

    private badRequest(): HttpError {
        return new HttpError({
            message: JSON.stringify(placeBidBadRequest),
            code: "BAD_REQUEST",
            status: HttpStatus.BAD_REQUEST,
        });
    }

    private applyBid(auction: ActiveAuction, bidValue: number): void {
        auction.auction_highest_bid = bidValue;
        auction.auction_highest_bidder = this.userId;
        auction.auction_number_of_bids += ONE_BID;
    }

    private placedBidResponse(auction: ActiveAuction, bidValue: number): PlaceBid.Response {
        return {
            success: true,
            auction_data: {
                id: auction.id,
                app_id: CS_APP_ID,
                auction_highest_bid: auction.auction_highest_bid,
                auction_highest_bidder: auction.auction_highest_bidder,
                auction_number_of_bids: auction.auction_number_of_bids,
                auction_ends_at: auction.auction_ends_at,
                above_recommended_price: auction.above_recommended_price,
            },
            invoice: {
                ...structuredClone(invoice),
                user_id: this.userId,
                amount_coins: bidValue,
                metadata: { deposit_id: auction.id },
            },
        };
    }
}
