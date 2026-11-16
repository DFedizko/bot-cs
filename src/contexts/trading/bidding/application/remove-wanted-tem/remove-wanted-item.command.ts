import { Command } from "@/packages/building-blocks/command";

export class RemoveWantedItemCommand extends Command {
    static readonly COMMAND_NAME = "remove_wanted_item";

    constructor(public readonly itemName: string) {
        super();
    }
}
