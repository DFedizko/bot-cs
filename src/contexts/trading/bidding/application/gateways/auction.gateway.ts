export interface AuctionGateway {
    getActiveAuctions(): Promise<AuctionDTO[]>;
    placeBid(auctionId: number, bidValue: number): Promise<AuctionDTO>;
}

export type AuctionDTO = {
    id: number;
    highestBid: number;
    highestBidderId: number;
    numberOfBids: number;
    aboveRecommendedPercentage: string;
    endsAt: Date;
};
