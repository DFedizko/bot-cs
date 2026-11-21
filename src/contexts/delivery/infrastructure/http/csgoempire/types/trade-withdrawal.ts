import type { TradeStatus, TradeStatusMessage } from "./trade-status";

export interface TradeWithdrawalSticker {
    wear: number | null;
    name: string;
    image: string;
}

export interface TradeWithdrawalItem {
    market_name: string;
    market_value: number;
    icon_url: string;
    id: number;
    is_commodity: boolean;
    name_color: string;
    price_is_unreliable: boolean;
    suggested_price: number;
    asset_id?: number;
    blue_percentage?: number | null;
    fade_percentage?: number | null;
    preview_id?: string;
    stickers?: TradeWithdrawalSticker[];
    type?: string;
    wear?: number;
    marketplace_privacy_protection_level?: "base" | "strict" | (string & {});
}

export interface TradePartner {
    steam_id: string;
    steam_name: string;
    avatar: string;
    avatar_full: string;
    profile_url: string;
    timecreated: number;
    steam_level: number;
}

export interface TradeWithdrawalMetadata {
    item_validation: { numWrongItemDetections?: number; validItemDetected: boolean; validatedAt?: number };
    expires_at: number;
    partner?: TradePartner;
    auction_number_of_bids?: number;
}

export interface TradeWithdrawal {
    id: number;
    total_value: number;
    item_id: number;
    item: TradeWithdrawalItem;
    status: TradeStatus;
    status_message: TradeStatusMessage;
    tradeoffer_id: number;
    metadata: TradeWithdrawalMetadata;
    created_at: string;
    updated_at: string;
}
