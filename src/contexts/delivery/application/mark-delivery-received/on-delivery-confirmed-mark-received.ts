import type { EventListener } from "@/packages/application/event-listener";
import { DeliveryConfirmedEvent } from "../../domain/delivery/events/delivery-confirmed.event";
import type { DeliveryStepDispatcher } from "../delivery-step-dispatcher";
import { MarkDeliveryReceivedCommand } from "./mark-delivery-received.command";

export class OnDeliveryConfirmedMarkReceived implements EventListener<DeliveryConfirmedEvent> {
    constructor(private readonly steps: DeliveryStepDispatcher) {}

    subscribedTo(): string {
        return DeliveryConfirmedEvent.EVENT_NAME;
    }

    on(event: DeliveryConfirmedEvent): Promise<void> {
        return this.steps.dispatch(event.payload.tradeId, new MarkDeliveryReceivedCommand(event.payload.tradeId));
    }
}
