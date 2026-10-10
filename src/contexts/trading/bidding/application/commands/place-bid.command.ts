import { Command } from "@/shared/building-blocks/command";

type CommandProps = {
    auctionId: number;
    bidValue: number;
};

export class PlaceBidCommand extends Command {
    public static readonly COMMAND_NAME = "place_bid";
    public readonly auctionId: number;
    public readonly bidValue: number;

    constructor(props: CommandProps) {
        super();
        this.auctionId = props.auctionId;
        this.bidValue = props.bidValue;
    }
}
