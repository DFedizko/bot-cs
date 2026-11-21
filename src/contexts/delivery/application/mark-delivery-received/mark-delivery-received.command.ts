import { Command } from "@/packages/building-blocks/command";

export class MarkDeliveryReceivedCommand extends Command {
    static readonly COMMAND_NAME = "mark_delivery_received";

    constructor(readonly tradeId: number) {
        super();
    }
}
