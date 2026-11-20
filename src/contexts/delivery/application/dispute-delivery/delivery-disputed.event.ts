import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type DeliveryDisputedPayload = { tradeId: number; accountId: number };

export class DeliveryDisputedEvent extends ApplicationEvent<DeliveryDisputedPayload> {
    static readonly EVENT_NAME = "delivery_disputed";

    constructor(payload: DeliveryDisputedPayload) {
        super({ name: DeliveryDisputedEvent.EVENT_NAME, payload });
    }
}
