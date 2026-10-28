import type { Command } from "@/packages/building-blocks/command";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";

export interface CommandBus {
    register(commandHandler: CommandHandler<Command>): void;
    dispatch(command: Command): Promise<void>;
}
