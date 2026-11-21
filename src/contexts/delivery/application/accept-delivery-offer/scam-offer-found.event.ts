import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type ScamOfferFoundPayload = { tradeId: number; accountId: number; offerId: string; reasons: string[] };

export class ScamOfferFoundEvent extends ApplicationEvent<ScamOfferFoundPayload> {
    static readonly EVENT_NAME = "scam_offer_found";

    constructor(payload: ScamOfferFoundPayload) {
        super({ name: ScamOfferFoundEvent.EVENT_NAME, payload });
    }
}
