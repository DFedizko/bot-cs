import { DeliveryStepCommand } from "../delivery-step.command";

export type CancelTradeOfferProps = { tradeId: number; accountId: number; offerId: string; reasons: string[] };

export class CancelTradeOfferCommand extends DeliveryStepCommand {
    static readonly COMMAND_NAME = "cancel_trade_offer";
    readonly tradeId: number;
    readonly accountId: number;
    readonly offerId: string;
    readonly reasons: string[];

    constructor(props: CancelTradeOfferProps) {
        super();
        this.tradeId = props.tradeId;
        this.accountId = props.accountId;
        this.offerId = props.offerId;
        this.reasons = [...props.reasons];
    }
}
