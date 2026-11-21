import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type DeliveryTrackingStoppedPayload = { tradeId: number; accountId: number; reason: string };

export class DeliveryTrackingStoppedEvent extends ApplicationEvent<DeliveryTrackingStoppedPayload> {
    static readonly EVENT_NAME = "delivery_tracking_stopped";

    constructor(payload: DeliveryTrackingStoppedPayload) {
        super({ name: DeliveryTrackingStoppedEvent.EVENT_NAME, payload });
    }
}
