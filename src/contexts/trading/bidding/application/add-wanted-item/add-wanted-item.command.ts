import { Command } from "@/packages/building-blocks/command";
import type { CriteriaPrimitives } from "../../domain/wanted-item/criteria/criteria.factory";

type CommandProps = {
    accountId: number;
    itemName: string;
    maxFor: string;
    criteria?: CriteriaPrimitives;
};

export class AddWantedItemCommand extends Command {
    static readonly COMMAND_NAME = "add_wanted_item";
    public readonly accountId: number;
    public readonly itemName: string;
    public readonly maxFor: string;
    public readonly criteria?: CriteriaPrimitives;

    constructor(props: CommandProps) {
        super();
        this.accountId = props.accountId;
        this.itemName = props.itemName;
        this.maxFor = props.maxFor;
        this.criteria = props.criteria;
    }
}
