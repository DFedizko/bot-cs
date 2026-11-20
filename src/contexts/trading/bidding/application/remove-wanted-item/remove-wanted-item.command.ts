import { Command } from "@/packages/building-blocks/command";

type CommandProps = {
    accountId: number;
    itemName: string;
};

export class RemoveWantedItemCommand extends Command {
    static readonly COMMAND_NAME = "remove_wanted_item";
    public readonly accountId: number;
    public readonly itemName: string;

    constructor(props: CommandProps) {
        super();
        this.accountId = props.accountId;
        this.itemName = props.itemName;
    }
}
