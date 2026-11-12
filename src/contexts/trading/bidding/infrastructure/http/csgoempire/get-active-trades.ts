import type { ItemSticker } from "@/contexts/trading/shared/infrastructure/csgoempire/types/item-sticker";
import type { MarketplacePrivacyProtectionLevel } from "@/contexts/trading/shared/infrastructure/csgoempire/types/marketplace-privacy-protection-level";
import type {
    TradeStatus,
    TradeStatusMessage,
} from "@/contexts/trading/shared/infrastructure/csgoempire/types/trade-status";

export namespace GetActiveTrades {
    export interface Response {
        success: true;
        data: {
            deposits: ActiveDeposit[];
            withdrawals: ActiveWithdrawal[];
        };
    }
    export type ErrorResponse = Record<string, never>;
    export type RateLimitResponse = "";
}

interface ActiveTrade<TItem, TMetadata> {
    id: number;
    total_value: number;
    item_id: number;
    item: TItem;
    status: TradeStatus;
    status_message: TradeStatusMessage;
    tradeoffer_id: number;
    metadata: TMetadata;
    created_at: string;
    updated_at: string;
}

export interface ActiveDeposit extends ActiveTrade<ActiveDepositItem, ActiveDepositMetadata> {
    suggested_price: number;
}

export type ActiveWithdrawal = ActiveTrade<ActiveWithdrawalItem, ActiveWithdrawalMetadata>;

interface ActiveDepositItem {
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
    stickers: ItemSticker[];
    suggested_price: number;
    tradable: boolean;
    trade_exists: boolean;
    tradelock: boolean;
    updated_at: string;
    wear: number;
}

interface ActiveWithdrawalItem {
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
    stickers?: ItemSticker[];
    type?: string;
    wear?: number;
    marketplace_privacy_protection_level?: MarketplacePrivacyProtectionLevel;
}

interface ItemValidation {
    numWrongItemDetections: number;
    validItemDetected: boolean;
    validatedAt?: number;
}

interface TradePartner {
    steam_id: string;
    steam_name: string;
    avatar: string;
    avatar_full: string;
    profile_url: string;
    timecreated: number;
    steam_level: number;
}

interface ActiveDepositMetadata {
    item_validation: ItemValidation;
    expires_at: number;
    trade_url: string;
    item_inspected: boolean;
    partner: TradePartner;
    auction_number_of_bids: number;
}

interface ActiveWithdrawalMetadata {
    item_validation: ItemValidation;
    expires_at: number;
    partner?: TradePartner;
    auction_number_of_bids: number;
}
