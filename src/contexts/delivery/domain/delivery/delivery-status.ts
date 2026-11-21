export enum DeliveryStatus {
    AWAITING_OFFER = "awaiting_offer",
    OFFER_ACCEPTED = "offer_accepted",
    CONFIRMED = "confirmed",
    RECEIVED = "received",
    DISPUTED = "disputed",
    FAILED = "failed",
    CANCELLED = "cancelled",
}

export const ALLOWED_TRANSITIONS: Readonly<Record<DeliveryStatus, readonly DeliveryStatus[]>> = {
    [DeliveryStatus.AWAITING_OFFER]: [
        DeliveryStatus.OFFER_ACCEPTED,
        DeliveryStatus.DISPUTED,
        DeliveryStatus.FAILED,
        DeliveryStatus.CANCELLED,
    ],
    [DeliveryStatus.DISPUTED]: [DeliveryStatus.OFFER_ACCEPTED, DeliveryStatus.FAILED, DeliveryStatus.CANCELLED],
    [DeliveryStatus.OFFER_ACCEPTED]: [DeliveryStatus.CONFIRMED, DeliveryStatus.FAILED],
    [DeliveryStatus.CONFIRMED]: [DeliveryStatus.RECEIVED],
    [DeliveryStatus.RECEIVED]: [],
    [DeliveryStatus.FAILED]: [],
    [DeliveryStatus.CANCELLED]: [],
};
