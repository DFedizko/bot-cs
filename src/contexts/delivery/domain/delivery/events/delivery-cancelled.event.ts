import { DomainEvent } from "@/packages/building-blocks/domain-event";
import type { TradeId } from "../trade-id";
import type { DeliveryIdentity } from "./delivery-identity";

export type DeliveryCancelledPayload = DeliveryIdentity;

export class DeliveryCancelledEvent extends DomainEvent<DeliveryCancelledPayload> {
    static readonly EVENT_NAME = "delivery_cancelled";

    constructor(tradeId: TradeId, payload: DeliveryCancelledPayload) {
        super({ aggregateId: tradeId, name: DeliveryCancelledEvent.EVENT_NAME, payload });
    }
}
