export type TrackedDelivery = { tradeId: number; accountId: number };

export interface DeliveryTrackers {
    track(delivery: TrackedDelivery): boolean;
    untrack(delivery: TrackedDelivery): boolean;
}
