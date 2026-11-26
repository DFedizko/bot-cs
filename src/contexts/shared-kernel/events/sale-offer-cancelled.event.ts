import { IntegrationEvent } from "@/packages/building-blocks/integration-event";
import type { SaleCancellationReason } from "./sale-cancellation-reason";
import type { SaleOfferIdentity } from "./sale-offer-identity";

export type SaleOfferCancelledPayload = SaleOfferIdentity & { reason: SaleCancellationReason };

export class SaleOfferCancelledEvent extends IntegrationEvent<SaleOfferCancelledPayload> {
    static readonly EVENT_NAME = "sale_offer_cancelled";

    constructor(payload: SaleOfferCancelledPayload) {
        super({ name: SaleOfferCancelledEvent.EVENT_NAME, payload });
    }
}
