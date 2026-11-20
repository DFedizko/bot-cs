import { Command } from "@/packages/building-blocks/command";

export class DisputeDeliveryCommand extends Command {
    static readonly COMMAND_NAME = "dispute_delivery";

    constructor(readonly tradeId: number) {
        super();
    }
}
