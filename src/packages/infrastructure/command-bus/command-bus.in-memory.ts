import { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { CommandBus } from "../../application/command-bus";
import type { Command } from "@/packages/building-blocks/command";
import { CommandNotRegisteredError } from "@/packages/error/command-not-registered.error";

export class CommandBusInMemory implements CommandBus {
    private readonly commandHandlers = new Map<string, CommandHandler<Command>>();

    register(commandHandler: CommandHandler<Command>): void {
        this.commandHandlers.set(commandHandler.subscribedTo(), commandHandler);
    }

    async dispatch(command: Command): Promise<void> {
        const commandHandler = this.commandHandlers.get(command.name);
        if (!commandHandler) throw new CommandNotRegisteredError(command.name);
        await commandHandler.handle(command);
    }
}
