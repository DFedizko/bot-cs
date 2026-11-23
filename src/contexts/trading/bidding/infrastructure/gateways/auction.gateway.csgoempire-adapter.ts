import type { AuctionDTO, AuctionGateway } from "@/contexts/trading/bidding/application/place-bid/auction.gateway";
import type { ActiveAuction } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/get-active-auctions";
import type { CsgoempireAuctionHttp } from "../http/csgoempire/csgoempire-auction.http";
import type { PlaceBid } from "../http/csgoempire/place-bid";
import { BidRejectedError } from "../../application/place-bid/bid-rejected.error";
import { BidOutcomeUnknownError } from "../../application/place-bid/bid-outcome-unknown.error";
import { HttpError } from "@/packages/infrastructure/http/errors/http.error";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";

const UNKNOWN_REASON = "unknown error";

export class AuctionGatewayCsgoempireAdapter implements AuctionGateway {
    constructor(private readonly csgoempireAuctionHttp: CsgoempireAuctionHttp) {}

    async getActiveAuctions(): Promise<AuctionDTO[]> {
        const activeAuctions = await this.csgoempireAuctionHttp.getActiveAuctions();
        return this.mapToDto(activeAuctions.active_auctions);
    }

    async placeBid(auctionId: number, bidValue: number): Promise<AuctionDTO> {
        const { auction_data } = await this.requestBid(auctionId, bidValue);
        const [auction] = this.mapToDto([auction_data]);
        return auction;
    }

    private async requestBid(auctionId: number, bidValue: number): Promise<PlaceBid.Response> {
        try {
            return await this.csgoempireAuctionHttp.placeBid({ deposit_id: auctionId.toString(), bid_value: bidValue });
        } catch (error: unknown) {
            throw this.classifyBidError(error, auctionId, bidValue);
        }
    }

    private classifyBidError(error: unknown, auctionId: number, bidValue: number): Error {
        const reason = error instanceof Error ? error.message : UNKNOWN_REASON;
        if (this.isRefusedRequest(error)) return new BidRejectedError(auctionId, bidValue, reason);
        return new BidOutcomeUnknownError(auctionId, bidValue, reason);
    }

    private isRefusedRequest(error: unknown): boolean {
        return (
            error instanceof HttpError &&
            error.httpStatus >= HttpStatus.BAD_REQUEST &&
            error.httpStatus < HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    private mapToDto(
        activeAuctions: Pick<
            ActiveAuction,
            | "id"
            | "above_recommended_price"
            | "auction_ends_at"
            | "auction_highest_bid"
            | "auction_number_of_bids"
            | "auction_highest_bidder"
        >[],
    ): AuctionDTO[] {
        return activeAuctions.map((auction) => ({
            id: auction.id,
            bidderId: auction.auction_highest_bidder,
            aboveRecommendedPercentage: String(auction.above_recommended_price),
            endsAt: new Date(auction.auction_ends_at),
            highestBid: auction.auction_highest_bid,
            numberOfBids: auction.auction_number_of_bids,
        }));
    }
}
