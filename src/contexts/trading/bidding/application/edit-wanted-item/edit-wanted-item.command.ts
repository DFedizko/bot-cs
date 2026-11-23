import { Command } from "@/packages/building-blocks/command";
import type { CriteriaPrimitives } from "../../domain/wanted-item/criteria/criteria.factory";
import type { MaxForPrimitives } from "../../domain/wanted-item/max-for/max-for";

type CommandProps = {
    accountId: number;
    itemName: string;
    maxFor?: MaxForPrimitives;
    criteria?: CriteriaPrimitives;
};

export class EditWantedItemCommand extends Command {
    static readonly COMMAND_NAME = "edit_wanted_item";
    public readonly accountId: number;
    public readonly itemName: string;
    public readonly maxFor?: MaxForPrimitives;
    public readonly criteria?: CriteriaPrimitives;

    constructor(props: CommandProps) {
        super();
        this.accountId = props.accountId;
        this.itemName = props.itemName;
        this.maxFor = props.maxFor;
        this.criteria = props.criteria;
    }
}
