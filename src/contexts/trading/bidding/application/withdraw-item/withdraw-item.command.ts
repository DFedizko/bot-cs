import { Command } from "@/packages/building-blocks/command";

type CommandProps = {
    itemId: number;
    accountId: number;
    value: number;
};

export class WithdrawItemCommand extends Command {
    static readonly COMMAND_NAME = "withdraw_item";
    public readonly itemId: number;
    public readonly accountId: number;
    public readonly value: number;

    constructor(props: CommandProps) {
        super();
        this.itemId = props.itemId;
        this.accountId = props.accountId;
        this.value = props.value;
    }
}
