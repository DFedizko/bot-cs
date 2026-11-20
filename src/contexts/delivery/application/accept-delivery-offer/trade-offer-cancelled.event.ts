import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type TradeOfferCancelledPayload = { tradeId: number; accountId: number; offerId: string; reasons: string[] };

export class TradeOfferCancelledEvent extends ApplicationEvent<TradeOfferCancelledPayload> {
    static readonly EVENT_NAME = "trade_offer_cancelled";

    constructor(payload: TradeOfferCancelledPayload) {
        super({ name: TradeOfferCancelledEvent.EVENT_NAME, payload });
    }
}
