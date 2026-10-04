import { Command } from "@/shared/building-blocks/command";

type CommandProps = {
    depositId: string;
    bidValue: number;
};

export class PlaceBidCommand extends Command {
    public static readonly COMMAND_NAME = "place_bid";
    public readonly depositId: string;
    public readonly bidValue: number;

    constructor(props: CommandProps) {
        super();
        this.depositId = props.depositId;
        this.bidValue = props.bidValue;
    }
}
