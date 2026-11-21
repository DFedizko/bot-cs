import { DomainEvent } from "@/packages/building-blocks/domain-event";
import type { TradeId } from "../trade-id";
import type { DeliveryIdentity } from "./delivery-identity";

export type DeliveryConfirmedPayload = DeliveryIdentity & { offerId: string };

export class DeliveryConfirmedEvent extends DomainEvent<DeliveryConfirmedPayload> {
    static readonly EVENT_NAME = "delivery_confirmed";

    constructor(tradeId: TradeId, payload: DeliveryConfirmedPayload) {
        super({ aggregateId: tradeId, name: DeliveryConfirmedEvent.EVENT_NAME, payload });
    }
}
