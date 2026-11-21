import type { CommandBus } from "@/packages/application/command-bus";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { Command } from "@/packages/building-blocks/command";
import { DeliveryStepFailedEvent } from "./delivery-step-failed.event";

export class DeliveryStepDispatcher {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    async dispatch(tradeId: number, step: Command): Promise<void> {
        try {
            await this.commandBus.dispatch(step);
        } catch (error) {
            await this.reportFailure(tradeId, step, (error as Error).message);
        }
    }

    private async reportFailure(tradeId: number, step: Command, reason: string): Promise<void> {
        this.logger.log(`Delivery step "${step.name}" of trade "${tradeId}" failed: ${reason}`);
        await this.eventBus.publish([new DeliveryStepFailedEvent({ tradeId, step: step.name, reason })]);
    }
}
