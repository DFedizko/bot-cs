import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import { DeliveryConfirmedEvent } from "../../domain/delivery/events/delivery-confirmed.event";
import { MarkDeliveryReceivedCommand } from "./mark-delivery-received.command";

export class OnDeliveryConfirmedMarkReceived implements EventListener<DeliveryConfirmedEvent> {
    constructor(private readonly commandBus: CommandBus) {}

    subscribedTo(): string {
        return DeliveryConfirmedEvent.EVENT_NAME;
    }

    on(event: DeliveryConfirmedEvent): Promise<void> {
        return this.commandBus.dispatch(new MarkDeliveryReceivedCommand(event.payload.tradeId));
    }
}
