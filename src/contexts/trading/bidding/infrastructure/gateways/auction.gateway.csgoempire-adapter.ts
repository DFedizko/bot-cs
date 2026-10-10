import type { AuctionDTO, AuctionGateway } from "@/contexts/trading/bidding/application/gateways/auction.gateway";
import type { ActiveAuction } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/get-active-auctions";
import type { CsgoempireAuctionHttp } from "../http/csgoempire/csgoempire-auction.http";

export class AuctionGatewayCsgoempireAdapter implements AuctionGateway {
    constructor(private readonly csgoempireAuctionHttp: CsgoempireAuctionHttp) {}

    async getActiveAuctions(): Promise<AuctionDTO[]> {
        const activeAuctions = await this.csgoempireAuctionHttp.getActiveAuctions();
        return this.mapToDto(activeAuctions.active_auctions);
    }

    async placeBid(auctionId: number, bidValue: number): Promise<AuctionDTO> {
        const { auction_data } = await this.csgoempireAuctionHttp.placeBid({
            deposit_id: auctionId.toString(),
            bid_value: bidValue,
        });
        const [auction] = this.mapToDto([auction_data]);
        return auction;
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
            aboveRecommendedPercentage: String(auction.above_recommended_price),
            endsAt: new Date(auction.auction_ends_at),
            highestBid: auction.auction_highest_bid,
            numberOfBids: auction.auction_number_of_bids,
            highestBidderId: auction.auction_highest_bidder,
        }));
    }
}
