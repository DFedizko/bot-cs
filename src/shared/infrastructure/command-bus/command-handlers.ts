import type { Command } from "@/shared/building-blocks/command";
import type { CommandHandler } from "@/shared/building-blocks/command-handler";
import { CommandNotRegisteredError } from "@/shared/error/command-not-registered.error";

export class CommandHandlers extends Map<string, CommandHandler<Command>> {
    constructor(commandHandlers: CommandHandler<Command>[]) {
        super();
        commandHandlers.forEach((commandHandler) => {
            this.set(commandHandler.subscribedTo(), commandHandler);
        });
    }

    get(commandName: string): CommandHandler<Command> {
        const commandHandler = super.get(commandName);
        if (!commandHandler) {
            throw new CommandNotRegisteredError(commandName);
        }
        return commandHandler;
    }
}
