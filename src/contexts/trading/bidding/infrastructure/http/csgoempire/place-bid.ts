export namespace PlaceBid {
    export interface Request {
        deposit_id: string;
        bid_value: number;
    }
    export interface Response {
        success: true;
        auction_data: PlaceBidAuctionData;
        invoice: PlaceBidInvoice;
    }
    export type ErrorResponse = Record<string, never>;
}

interface PlaceBidAuctionData {
    id: number;
    app_id?: number;
    auction_highest_bid: number;
    auction_highest_bidder: number;
    auction_number_of_bids: number;
    auction_ends_at: number;
    above_recommended_price: number;
}

interface PlaceBidInvoiceMetadata {
    deposit_id: number;
}

export interface PlaceBidInvoice {
    id: number;
    user_id: number;
    status: number;
    status_name: string;
    processor_id: number;
    processor_name: string;
    processor_ref: string;
    currency_id: number;
    currency_code: string;
    amount_coins: number;
    metadata: PlaceBidInvoiceMetadata;
    ip: string;
    created_at: number;
    updated_at: number;
    complete_at: number | null;
    refunded_at: number | null;
}
