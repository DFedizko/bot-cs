import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import type { Logger } from "@/packages/application/logger";
import { DeliveryConfirmedEvent } from "../../domain/delivery/events/delivery-confirmed.event";
import { dispatchOrLog } from "../dispatch-or-log";
import { MarkDeliveryReceivedCommand } from "./mark-delivery-received.command";

export class OnDeliveryConfirmedMarkReceived implements EventListener<DeliveryConfirmedEvent> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return DeliveryConfirmedEvent.EVENT_NAME;
    }

    on(event: DeliveryConfirmedEvent): Promise<void> {
        return dispatchOrLog(this.commandBus, this.logger, new MarkDeliveryReceivedCommand(event.payload.tradeId));
    }
}
