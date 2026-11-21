import { DeliveryStepCommand } from "../delivery-step.command";

export class ConfirmTradeOfferCommand extends DeliveryStepCommand {
    static readonly COMMAND_NAME = "confirm_trade_offer";

    constructor(readonly tradeId: number) {
        super();
    }
}
