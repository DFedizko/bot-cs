export type TrackedDelivery = { tradeId: number; accountId: number; sentAt?: number };

export interface DeliveryTrackers {
    track(delivery: TrackedDelivery): boolean;
    untrack(delivery: TrackedDelivery): boolean;
}
