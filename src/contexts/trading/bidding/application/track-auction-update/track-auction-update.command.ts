import { Command } from "@/packages/building-blocks/command";

type CommandProps = {
    auctionId: number;
    bidderId: number;
    value: number;
    endsAt: number;
};

export class TrackAuctionUpdateCommand extends Command {
    static readonly COMMAND_NAME = "track_auction_update";
    public readonly auctionId: number;
    public readonly bidderId: number;
    public readonly value: number;
    public readonly endsAt: number;

    constructor(props: CommandProps) {
        super();
        this.auctionId = props.auctionId;
        this.bidderId = props.bidderId;
        this.value = props.value;
        this.endsAt = props.endsAt;
    }
}
