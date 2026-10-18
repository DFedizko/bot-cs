import { Command } from "@/shared/building-blocks/command";

export class InitializeCsgoempireSessionCommand extends Command {
    static readonly COMMAND_NAME = "initialize_csgoempire_session";

    constructor(public readonly authenticated: boolean) {
        super();
    }
}
