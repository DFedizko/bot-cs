import { DomainEvent } from "@/packages/building-blocks/domain-event";
import type { TradeId } from "../trade-id";
import type { DeliveryIdentity } from "./delivery-identity";

export type DeliveryStartedPayload = DeliveryIdentity;

export class DeliveryStartedEvent extends DomainEvent<DeliveryStartedPayload> {
    static readonly EVENT_NAME = "delivery_started";

    constructor(tradeId: TradeId, payload: DeliveryStartedPayload) {
        super({ aggregateId: tradeId, name: DeliveryStartedEvent.EVENT_NAME, payload });
    }
}
