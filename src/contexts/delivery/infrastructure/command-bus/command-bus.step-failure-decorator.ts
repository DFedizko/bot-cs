import type { CommandBus } from "@/packages/application/command-bus";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { Command } from "@/packages/building-blocks/command";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { DeliveryStepCommand } from "../../application/delivery-step.command";
import { DeliveryStepFailedEvent } from "../../application/delivery-step-failed.event";

export class CommandBusStepFailureDecorator implements CommandBus {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    register(commandHandler: CommandHandler<Command>): void {
        this.commandBus.register(commandHandler);
    }

    async dispatch(command: Command): Promise<void> {
        try {
            await this.commandBus.dispatch(command);
        } catch (error) {
            if (!(command instanceof DeliveryStepCommand)) throw error;
            await this.reportFailure(command, this.reasonOf(error));
        }
    }

    private async reportFailure(step: DeliveryStepCommand, reason: string): Promise<void> {
        this.logger.log(`Delivery step "${step.name}" of trade "${step.tradeId}" failed: ${reason}`);
        await this.eventBus.publish([new DeliveryStepFailedEvent({ tradeId: step.tradeId, step: step.name, reason })]);
    }

    private reasonOf(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
