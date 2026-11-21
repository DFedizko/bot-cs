import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import type { Event } from "@/packages/building-blocks/event";
import type { DeliveryIdentity } from "../../domain/delivery/events/delivery-identity";
import { StopDeliveryTrackingCommand } from "./stop-delivery-tracking.command";

export class OnDeliveryEndedStopTracking implements EventListener<Event<DeliveryIdentity>> {
    constructor(
        private readonly endingEvent: string,
        private readonly commandBus: CommandBus,
    ) {}

    subscribedTo(): string {
        return this.endingEvent;
    }

    on(event: Event<DeliveryIdentity>): Promise<void> {
        const { tradeId, accountId } = event.payload;
        return this.commandBus.dispatch(new StopDeliveryTrackingCommand({ tradeId, accountId, reason: event.name }));
    }
}
