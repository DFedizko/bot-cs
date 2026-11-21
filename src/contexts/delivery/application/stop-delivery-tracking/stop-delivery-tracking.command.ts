import { DeliveryStepCommand } from "../delivery-step.command";

export type StopDeliveryTrackingProps = { tradeId: number; accountId: number; reason: string };

export class StopDeliveryTrackingCommand extends DeliveryStepCommand {
    static readonly COMMAND_NAME = "stop_delivery_tracking";
    readonly tradeId: number;
    readonly accountId: number;
    readonly reason: string;

    constructor(props: StopDeliveryTrackingProps) {
        super();
        this.tradeId = props.tradeId;
        this.accountId = props.accountId;
        this.reason = props.reason;
    }
}
