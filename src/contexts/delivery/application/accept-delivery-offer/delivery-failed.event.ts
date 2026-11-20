import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type DeliveryFailedPayload = { tradeId: number; accountId: number; offerId: string; reason: string };

export class DeliveryFailedEvent extends ApplicationEvent<DeliveryFailedPayload> {
    static readonly EVENT_NAME = "delivery_failed";

    constructor(payload: DeliveryFailedPayload) {
        super({ name: DeliveryFailedEvent.EVENT_NAME, payload });
    }
}
