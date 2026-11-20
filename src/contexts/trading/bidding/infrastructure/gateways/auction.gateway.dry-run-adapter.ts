import type { AuctionDTO, AuctionGateway } from "../../application/place-bid/auction.gateway";
import type { Logger } from "@/packages/application/logger";

const ONE_BID = 1;
const NO_BIDS = 0;
const NO_BID_VALUE = 0;
const UNKNOWN_PERCENTAGE = "0";
const UNKNOWN_END_TIME = 0;

export class AuctionGatewayDryRunAdapter implements AuctionGateway {
    private readonly dryRunBids = new Map<number, AuctionDTO>();

    constructor(
        private readonly auctionGateway: AuctionGateway,
        private readonly logger: Logger,
        private readonly accountId: number,
    ) {}

    getActiveAuctions(): Promise<AuctionDTO[]> {
        return this.auctionGateway.getActiveAuctions();
    }

    async placeBid(auctionId: number, bidValue: number): Promise<AuctionDTO> {
        const auction = this.dryRunBids.get(auctionId) ?? this.untrackedAuction(auctionId);
        const bidPlaced = this.applyBid(auction, bidValue);
        this.dryRunBids.set(auctionId, bidPlaced);
        this.logger.log(`Dry run: skipped a bid of ${bidValue} on auction "${auctionId}"`);
        return bidPlaced;
    }

    private untrackedAuction(auctionId: number): AuctionDTO {
        return {
            id: auctionId,
            highestBid: NO_BID_VALUE,
            bidderId: this.accountId,
            numberOfBids: NO_BIDS,
            aboveRecommendedPercentage: UNKNOWN_PERCENTAGE,
            endsAt: new Date(UNKNOWN_END_TIME),
        };
    }

    private applyBid(auction: AuctionDTO, bidValue: number): AuctionDTO {
        return {
            ...auction,
            highestBid: bidValue,
            bidderId: this.accountId,
            numberOfBids: auction.numberOfBids + ONE_BID,
        };
    }
}
