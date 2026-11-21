import type { Command } from "@/packages/building-blocks/command";
import type { CommandBus } from "@/packages/application/command-bus";
import type { Logger } from "@/packages/application/logger";
import type { CommandDispatcher, DispatchContext } from "./command-dispatcher";

const CONTEXT_SEPARATOR = ", ";

export class CommandDispatcherErrorBoundary implements CommandDispatcher {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly logger: Logger,
    ) {}

    async dispatch(command: Command, context: DispatchContext): Promise<void> {
        try {
            await this.commandBus.dispatch(command);
        } catch (error: unknown) {
            this.logFailure(command, context, error);
        }
    }

    private logFailure(command: Command, context: DispatchContext, error: unknown): void {
        this.logger.log(`Command "${command.name}" failed (${this.describe(context)}): ${this.reasonOf(error)}`);
    }

    private describe(context: DispatchContext): string {
        return Object.entries(context)
            .map(([key, value]) => `${key}=${value}`)
            .join(CONTEXT_SEPARATOR);
    }

    private reasonOf(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
