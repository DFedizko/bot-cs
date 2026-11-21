import type { CommandBus } from "@/packages/application/command-bus";
import type { Logger } from "@/packages/application/logger";
import type { Command } from "@/packages/building-blocks/command";

export const dispatchOrLog = async (bus: CommandBus, logger: Logger, command: Command): Promise<void> => {
    try {
        await bus.dispatch(command);
    } catch (error) {
        logger.log(`Delivery step "${command.name}" failed: ${(error as Error).message}`);
    }
};
