import { Command } from "@/packages/building-blocks/command";

export class SynchronizeAccountCommand extends Command {
    static readonly COMMAND_NAME = "synchronize_account";

    constructor(
        public readonly accountId: number,
        public readonly accountName: string,
        public readonly balance: number,
    ) {
        super();
    }
}
