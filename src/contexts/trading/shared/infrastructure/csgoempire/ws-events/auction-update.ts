export type AuctionUpdate = {
    id: number;
    above_recommended_price: number;
    auction_highest_bid: number;
    auction_highest_bidder: number;
    auction_number_of_bids: number;
    auction_ends_at: number;
}[];
