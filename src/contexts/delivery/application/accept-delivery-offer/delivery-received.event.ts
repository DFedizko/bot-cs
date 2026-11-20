import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type DeliveryReceivedPayload = { tradeId: number; accountId: number; offerId: string };

export class DeliveryReceivedEvent extends ApplicationEvent<DeliveryReceivedPayload> {
    static readonly EVENT_NAME = "delivery_received";

    constructor(payload: DeliveryReceivedPayload) {
        super({ name: DeliveryReceivedEvent.EVENT_NAME, payload });
    }
}
