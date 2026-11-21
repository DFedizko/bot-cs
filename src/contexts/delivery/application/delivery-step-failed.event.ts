import { ApplicationEvent } from "@/packages/building-blocks/application-event";

export type DeliveryStepFailedPayload = { tradeId: number; step: string; reason: string };

export class DeliveryStepFailedEvent extends ApplicationEvent<DeliveryStepFailedPayload> {
    static readonly EVENT_NAME = "delivery_step_failed";

    constructor(payload: DeliveryStepFailedPayload) {
        super({ name: DeliveryStepFailedEvent.EVENT_NAME, payload });
    }
}
