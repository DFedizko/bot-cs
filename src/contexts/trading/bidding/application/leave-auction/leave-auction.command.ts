import { Command } from "@/packages/building-blocks/command";

export class LeaveAuctionCommand extends Command {
    static readonly COMMAND_NAME = "leave_auction";

    constructor(public readonly auctionId: number) {
        super();
    }
}
