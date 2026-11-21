import { Command } from "@/packages/building-blocks/command";

export class ConfirmTradeOfferCommand extends Command {
    static readonly COMMAND_NAME = "confirm_trade_offer";

    constructor(readonly tradeId: number) {
        super();
    }
}
