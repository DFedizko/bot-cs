import { Command } from "@/packages/building-blocks/command";

type CommandProps = {
    auctionId: number;
    accountId: number;
    bidValue: number;
    maxBid?: number;
};

export class PlaceBidCommand extends Command {
    public static readonly COMMAND_NAME = "place_bid";
    public readonly auctionId: number;
    public readonly accountId: number;
    public readonly bidValue: number;
    public readonly maxBid?: number;

    constructor(props: CommandProps) {
        super();
        this.auctionId = props.auctionId;
        this.accountId = props.accountId;
        this.bidValue = props.bidValue;
        this.maxBid = props.maxBid;
    }
}
