import type { PlaceBid, PlaceBidInvoice } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/place-bid";
import { CS_APP_ID } from "@/shared-kernel/domain/cs-app-id";

export const placeBidRequest = {
    deposit_id: "28396506",
    bid_value: 64,
} satisfies PlaceBid.Request;

export const invoice = {
    id: 5190329,
    user_id: 303119,
    status: 200,
    status_name: "CREATED",
    processor_id: 1,
    processor_name: "Steam P2P",
    processor_ref: "15064711",
    currency_id: 1,
    currency_code: "CSGOEMPIRE_COIN",
    amount_coins: 64,
    metadata: {
        deposit_id: 28396506,
    },
    ip: "0.0.0.0",
    created_at: 1638279490,
    updated_at: 1638279494,
    complete_at: null,
    refunded_at: null,
} satisfies PlaceBidInvoice;

export const placeBidSuccess = {
    success: true,
    auction_data: {
        id: 28396506,
        app_id: CS_APP_ID,
        auction_highest_bid: 64,
        auction_highest_bidder: 303119,
        auction_number_of_bids: 11,
        auction_ends_at: 1638279554,
        above_recommended_price: -3.73,
    },
    invoice,
} satisfies PlaceBid.Response;

export const placeBidError = {} satisfies PlaceBid.ErrorResponse;
