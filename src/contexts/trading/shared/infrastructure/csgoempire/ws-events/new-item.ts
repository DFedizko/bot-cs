import type { DepositorStats } from "../types/depositor-stats";
import type { ItemSearch } from "../types/item-search";
import type { ItemSticker } from "../types/item-sticker";
import type { MarketplacePrivacyProtectionLevel } from "../types/marketplace-privacy-protection-level";

export interface NewItem {
    id: number;
    market_name: string;
    market_value: number;
    purchase_price: number;
    suggested_price: number;
    above_recommended_price: number;
    price_is_unreliable: boolean;
    is_commodity: boolean;

    icon_url: string;
    name_color: string;
    wear_name: string;
    published_at: string;

    auction_ends_at: number | null;
    auction_highest_bid: number | null;
    auction_highest_bidder: number | null;
    auction_number_of_bids: number;

    marketplace_privacy_protection_level: MarketplacePrivacyProtectionLevel;
    item_search: ItemSearch;
    depositor_stats: DepositorStats;

    wear?: number | null;
    preview_id?: string | null;
    stickers?: ItemSticker[];
    blue_percentage?: number | null;
    fade_percentage?: number | null;
}

export type NewItemEvent = ["new_item", NewItem[]];
