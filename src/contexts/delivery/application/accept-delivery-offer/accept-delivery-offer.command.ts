import { Command } from "@/packages/building-blocks/command";

export class AcceptDeliveryOfferCommand extends Command {
    static readonly COMMAND_NAME = "accept_delivery_offer";

    constructor(readonly tradeId: number) {
        super();
    }
}
