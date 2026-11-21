import { DomainEvent } from "@/packages/building-blocks/domain-event";
import type { TradeId } from "../trade-id";
import type { DeliveryIdentity } from "./delivery-identity";

export type DeliveryDisputedPayload = DeliveryIdentity;

export class DeliveryDisputedEvent extends DomainEvent<DeliveryDisputedPayload> {
    static readonly EVENT_NAME = "delivery_disputed";

    constructor(tradeId: TradeId, payload: DeliveryDisputedPayload) {
        super({ aggregateId: tradeId, name: DeliveryDisputedEvent.EVENT_NAME, payload });
    }
}
