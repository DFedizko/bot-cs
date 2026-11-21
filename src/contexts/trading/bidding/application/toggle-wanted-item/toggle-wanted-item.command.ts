import { Command } from "@/packages/building-blocks/command";

type CommandProps = {
    accountId: number;
    itemName: string;
    enabled: boolean;
};

export class ToggleWantedItemCommand extends Command {
    static readonly COMMAND_NAME = "toggle_wanted_item";
    public readonly accountId: number;
    public readonly itemName: string;
    public readonly enabled: boolean;

    constructor(props: CommandProps) {
        super();
        this.accountId = props.accountId;
        this.itemName = props.itemName;
        this.enabled = props.enabled;
    }
}
