export namespace GetActiveAuctions {
    export interface Response {
        success: true;
        active_auctions: ActiveAuction[];
    }
    export type ErrorResponse = Record<string, never>;
}

export interface ActiveAuction extends AuctionItem {
    auction_ends_at: number;
    auction_highest_bid: number;
    auction_highest_bidder: number;
    custom_price_percentage: number;
    depositor_stats: ActiveAuctionDepositorStats;
}

type AuctionItem = {
    id: number;
    market_name: string;
    market_value: number;
    above_recommended_price: number;
    price_is_unreliable: boolean;
    is_commodity: boolean;
    icon_url: string;
    name_color: string;
    published_at: string;
    auction_number_of_bids: number;
    wear: number | null;
    preview_id: string | null;
    stickers: ActiveAuctionSticker[];
};

interface ActiveAuctionSticker {
    wear: number | null;
    name: string;
    image: string;
}

interface ActiveAuctionDepositorStats {
    delivery_rate_recent: number | null;
    delivery_rate_long: number | null;
    delivery_time_minutes_recent: number | null;
    delivery_time_minutes_long: number | null;
    steam_level_min_range: number | null;
    steam_level_max_range: number | null;
    user_has_trade_notifications_enabled: boolean;
    user_is_online: boolean | null;
}
