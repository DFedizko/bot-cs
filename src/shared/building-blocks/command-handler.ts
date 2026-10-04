import type { Command } from "./command";

export interface CommandHandler<T extends Command> {
    subscribedTo(): T;
    handle(command: T): Promise<void>;
}
