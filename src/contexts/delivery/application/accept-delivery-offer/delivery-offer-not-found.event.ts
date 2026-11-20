import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type DeliveryOfferNotFoundPayload = { tradeId: number; accountId: number; matchingOffers: number };

export class DeliveryOfferNotFoundEvent extends ApplicationEvent<DeliveryOfferNotFoundPayload> {
    static readonly EVENT_NAME = "delivery_offer_not_found";

    constructor(payload: DeliveryOfferNotFoundPayload) {
        super({ name: DeliveryOfferNotFoundEvent.EVENT_NAME, payload });
    }
}
