import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type TradeOfferAcceptedPayload = { tradeId: number; accountId: number; offerId: string };

export class TradeOfferAcceptedEvent extends ApplicationEvent<TradeOfferAcceptedPayload> {
    static readonly EVENT_NAME = "trade_offer_accepted";

    constructor(payload: TradeOfferAcceptedPayload) {
        super({ name: TradeOfferAcceptedEvent.EVENT_NAME, payload });
    }
}
