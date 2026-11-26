import { IntegrationEvent } from "@/packages/building-blocks/integration-event";
import type { SaleOfferIdentity } from "./sale-offer-identity";

export type SaleOfferSentPayload = SaleOfferIdentity;

export class SaleOfferSentEvent extends IntegrationEvent<SaleOfferSentPayload> {
    static readonly EVENT_NAME = "sale_offer_sent";

    constructor(payload: SaleOfferSentPayload) {
        super({ name: SaleOfferSentEvent.EVENT_NAME, payload });
    }
}
