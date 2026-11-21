import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type ScamOffer = { offerId: string; reasons: string[] };

export type ScamOffersFoundPayload = { tradeId: number; accountId: number; offers: ScamOffer[] };

export class ScamOffersFoundEvent extends ApplicationEvent<ScamOffersFoundPayload> {
    static readonly EVENT_NAME = "scam_offers_found";

    constructor(payload: ScamOffersFoundPayload) {
        super({ name: ScamOffersFoundEvent.EVENT_NAME, payload });
    }
}
