import { Command } from "@/packages/building-blocks/command";

type CommandProps = {
    itemId: number;
    accountId: number;
    itemName: string;
    price: number;
    aboveRecommendedPercentage: string;
    referencePrice: number;
    numberOfBids: number;
    inAuction: boolean;
};

export class EvaluateItemCommand extends Command {
    public static readonly COMMAND_NAME = "evaluate_item";
    public readonly itemId: number;
    public readonly accountId: number;
    public readonly itemName: string;
    public readonly price: number;
    public readonly aboveRecommendedPercentage: string;
    public readonly referencePrice: number;
    public readonly numberOfBids: number;
    public readonly inAuction: boolean;

    constructor(props: CommandProps) {
        super();
        this.itemId = props.itemId;
        this.accountId = props.accountId;
        this.itemName = props.itemName;
        this.price = props.price;
        this.aboveRecommendedPercentage = props.aboveRecommendedPercentage;
        this.referencePrice = props.referencePrice;
        this.numberOfBids = props.numberOfBids;
        this.inAuction = props.inAuction;
    }
}
