import type { CommandBus } from "../../infrastructure/command-bus/command-bus";
import type { CommandHandlers } from "../../infrastructure/command-bus/command-handlers";
import type { Command } from "@/shared/building-blocks/command";

export class CommandBusInMemory implements CommandBus {
    constructor(private readonly commandHandlers: CommandHandlers) {}

    async dispatch(command: Command): Promise<void> {
        const commandHandler = this.commandHandlers.get(command.name);
        await commandHandler.handle(command);
    }
}
