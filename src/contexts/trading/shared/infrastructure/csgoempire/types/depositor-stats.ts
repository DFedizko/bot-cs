import type { DeliveryRateStatus } from "./delivery-rate-status";

export interface DepositorStats {
    delivery_rate_recent: number | null;
    delivery_rate_long: number | null;
    delivery_time_minutes_recent: number | null;
    delivery_time_minutes_long: number | null;
    delivery_rate_status: DeliveryRateStatus | null;
    steam_level_min_range: number | null;
    steam_level_max_range: number | null;
    user_has_trade_notifications_enabled: boolean;
    user_online_status: number;
}
