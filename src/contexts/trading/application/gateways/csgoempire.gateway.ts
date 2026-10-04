export interface CsgoempireGateway {
    placeBid(depositId: string, bidValue: number): Promise<CsgoempireGatewayIO.PlaceBidOutput>;
}

export namespace CsgoempireGatewayIO {
    export interface PlaceBidOutput {
        success: true;
        auction_data: {
            id: number;
            above_recommended_price: number;
            auction_highest_bid: number;
            auction_highest_bidder: number;
            auction_number_of_bids: number;
            auction_ends_at: number;
        };
        invoice: {
            user_id: number;
            status: number;
            processor_id: number;
            currency_id: number;
            amount_coins: number;
            metadata: {
                deposit_id: number;
            };
            ip: string;
            updated_at: number;
            created_at: number;
            id: number;
            processor_ref: string;
            status_name: string;
            processor_name: string;
            currency_code: string;
            complete_at: string;
            refunded_at: string;
        };
    }
}
