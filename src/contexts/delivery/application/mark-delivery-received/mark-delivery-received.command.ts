import { DeliveryStepCommand } from "../delivery-step.command";

export class MarkDeliveryReceivedCommand extends DeliveryStepCommand {
    static readonly COMMAND_NAME = "mark_delivery_received";

    constructor(readonly tradeId: number) {
        super();
    }
}
