import { DomainEvent } from "@/packages/building-blocks/domain-event";
import type { TradeId } from "../trade-id";
import type { DeliveryIdentity } from "./delivery-identity";

export type DeliveryReceivedPayload = DeliveryIdentity & { offerId: string };

export class DeliveryReceivedEvent extends DomainEvent<DeliveryReceivedPayload> {
    static readonly EVENT_NAME = "delivery_received";

    constructor(tradeId: TradeId, payload: DeliveryReceivedPayload) {
        super({ aggregateId: tradeId, name: DeliveryReceivedEvent.EVENT_NAME, payload });
    }
}
