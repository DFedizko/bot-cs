import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { DeliveryTrackers } from "../delivery-trackers";
import { DeliveryTrackingStoppedEvent } from "./delivery-tracking-stopped.event";
import { StopDeliveryTrackingCommand } from "./stop-delivery-tracking.command";

export class StopDeliveryTrackingCommandHandler implements CommandHandler<StopDeliveryTrackingCommand> {
    constructor(
        private readonly trackers: DeliveryTrackers,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return StopDeliveryTrackingCommand.COMMAND_NAME;
    }

    async handle(command: StopDeliveryTrackingCommand): Promise<void> {
        const { tradeId, accountId, reason } = command;
        if (!this.trackers.untrack({ tradeId, accountId })) return;
        this.logger.log(`Stopped tracking trade "${tradeId}" of account "${accountId}": ${reason}`);
        await this.eventBus.publish([new DeliveryTrackingStoppedEvent({ tradeId, accountId, reason })]);
    }
}
