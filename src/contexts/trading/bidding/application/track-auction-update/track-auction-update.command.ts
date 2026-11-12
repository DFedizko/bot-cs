import { Command } from "@/packages/building-blocks/command";

type CommandProps = {
    auctionId: number;
    accountId: number;
    bidderId: number;
    value: number;
    endsAt: number;
};

export class TrackAuctionUpdateCommand extends Command {
    static readonly COMMAND_NAME = "track_auction_update";
    public readonly auctionId: number;
    public readonly accountId: number;
    public readonly bidderId: number;
    public readonly value: number;
    public readonly endsAt: number;

    constructor(props: CommandProps) {
        super();
        this.auctionId = props.auctionId;
        this.accountId = props.accountId;
        this.bidderId = props.bidderId;
        this.value = props.value;
        this.endsAt = props.endsAt;
    }
}
