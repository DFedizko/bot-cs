import type { AuctionDTO, AuctionGateway } from "../../application/place-bid/auction.gateway";
import type { Logger } from "@/packages/application/logger";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";

const ONE_BID = 1;

export class AuctionGatewayDryRunAdapter implements AuctionGateway {
    constructor(
        private readonly auctionGateway: AuctionGateway,
        private readonly logger: Logger,
        private readonly accountId: number,
    ) {}

    getActiveAuctions(): Promise<AuctionDTO[]> {
        return this.auctionGateway.getActiveAuctions();
    }

    async placeBid(auctionId: number, bidValue: number): Promise<AuctionDTO> {
        const auction = await this.findAuction(auctionId);
        this.logger.log(`Dry run: skipped a bid of ${bidValue} on auction "${auctionId}"`);
        return this.applyBid(auction, bidValue);
    }

    private async findAuction(auctionId: number): Promise<AuctionDTO> {
        const auctions = await this.auctionGateway.getActiveAuctions();
        const auction = auctions.find(({ id }) => id === auctionId);
        if (!auction) throw new NotFoundError(`Auction not found by the id "${auctionId}"`);
        return auction;
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
