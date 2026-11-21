import type { TradeStatus, TradeStatusMessage } from "./types/trade-status";
import type { TradePartner, TradeWithdrawal, TradeWithdrawalSticker } from "./types/trade-withdrawal";

export namespace GetActiveTrades {
    export interface Response {
        success: true;
        data: { deposits: GetActiveTradesDeposit[]; withdrawals: TradeWithdrawal[] };
    }
    export type ErrorResponse = Record<string, never>;
    export type RateLimitResponse = "";
}

export interface GetActiveTradesDeposit {
    id: number;
    total_value: number;
    item_id: number;
    item: GetActiveTradesDepositItem;
    status: TradeStatus;
    status_message: TradeStatusMessage;
    tradeoffer_id: number;
    metadata: GetActiveTradesDepositMetadata;
    created_at: string;
    updated_at: string;
    suggested_price: number;
}

interface GetActiveTradesDepositItem {
    app_id?: number;
    context_id?: number;
    type: string;
    asset_id: number;
    blue_percentage: number | null;
    created_at: string;
    fade_percentage: number | null;
    full_position: number;
    icon_url: string;
    id: number;
    is_commodity: boolean;
    market_name: string;
    market_value: number;
    name_color: string;
    position: number | null;
    preview_id: string;
    price_is_unreliable: boolean;
    stickers: TradeWithdrawalSticker[];
    suggested_price: number;
    tradable: boolean;
    trade_exists: boolean;
    tradelock: boolean;
    updated_at: string;
    wear: number;
}

interface GetActiveTradesDepositMetadata {
    item_validation: { numWrongItemDetections: number; validItemDetected: boolean; validatedAt?: number };
    expires_at: number;
    trade_url: string;
    item_inspected: boolean;
    partner: TradePartner;
    auction_number_of_bids: number;
}
