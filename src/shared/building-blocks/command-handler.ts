import type { Command } from "./command";

export interface CommandHandler<T extends Command> {
    subscribedTo(): string;
    handle(command: T): Promise<void>;
}
