import { Command } from "@/packages/building-blocks/command";

export class TrackDeliveryCommand extends Command {
    static readonly COMMAND_NAME = "track_delivery";

    constructor(
        readonly tradeId: number,
        readonly sentAt?: number,
    ) {
        super();
    }
}
