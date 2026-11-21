import { DomainEvent } from "@/packages/building-blocks/domain-event";
import type { TradeId } from "../trade-id";
import type { DeliveryIdentity } from "./delivery-identity";
import type { DeliveryFailureReason } from "../delivery-failure-reason";

export type DeliveryFailedPayload = DeliveryIdentity & { offerId?: string; reason: DeliveryFailureReason };

export class DeliveryFailedEvent extends DomainEvent<DeliveryFailedPayload> {
    static readonly EVENT_NAME = "delivery_failed";

    constructor(tradeId: TradeId, payload: DeliveryFailedPayload) {
        super({ aggregateId: tradeId, name: DeliveryFailedEvent.EVENT_NAME, payload });
    }
}
