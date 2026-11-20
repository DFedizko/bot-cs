import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type DeliveryStartedPayload = { tradeId: number; accountId: number };

export class DeliveryStartedEvent extends ApplicationEvent<DeliveryStartedPayload> {
    static readonly EVENT_NAME = "delivery_started";

    constructor(payload: DeliveryStartedPayload) {
        super({ name: DeliveryStartedEvent.EVENT_NAME, payload });
    }
}
