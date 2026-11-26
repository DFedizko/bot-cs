import { IntegrationEvent } from "@/packages/building-blocks/integration-event";
import type { SaleOfferIdentity } from "./sale-offer-identity";

export type SaleOfferAcceptedPayload = SaleOfferIdentity;

export class SaleOfferAcceptedEvent extends IntegrationEvent<SaleOfferAcceptedPayload> {
    static readonly EVENT_NAME = "sale_offer_accepted";

    constructor(payload: SaleOfferAcceptedPayload) {
        super({ name: SaleOfferAcceptedEvent.EVENT_NAME, payload });
    }
}
