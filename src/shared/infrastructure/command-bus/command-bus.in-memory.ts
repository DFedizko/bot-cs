import { CommandHandler } from "@/shared/building-blocks/command-handler";
import { CommandBus } from "./command-bus";
import { CommandHandlers } from "./command-handlers";
import { Command } from "@/shared/building-blocks/command";

export class CommandBusInMemory implements CommandBus {
    constructor(private readonly commandHandlers: CommandHandlers) {}

    async dispatch(command: Command): Promise<void> {
        const commandHandler = this.commandHandlers.get(command.name);
        await commandHandler.handle(command);
    }
}
