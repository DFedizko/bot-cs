import { DomainEvent } from "@/packages/building-blocks/domain-event";
import type { TradeId } from "../trade-id";
import type { DeliveryIdentity } from "./delivery-identity";

export type TradeOfferAcceptedPayload = DeliveryIdentity & { offerId: string; needsConfirmation: boolean };

export class TradeOfferAcceptedEvent extends DomainEvent<TradeOfferAcceptedPayload> {
    static readonly EVENT_NAME = "trade_offer_accepted";

    constructor(tradeId: TradeId, payload: TradeOfferAcceptedPayload) {
        super({ aggregateId: tradeId, name: TradeOfferAcceptedEvent.EVENT_NAME, payload });
    }
}
