import type { CsgDeliveryWsClient } from "../ws/csgoempire/csg-delivery.ws-client";
import type { TradeStatusEvent, TradeStatusUpdate } from "../ws/csgoempire/trade-status";
import type { WithdrawalTrackingDispatcher } from "./withdrawal-tracking.dispatcher";

const TRADE_STATUS = "trade_status";
const WITHDRAWAL = "withdrawal";

export class TradeStatusWsController {
    constructor(
        private readonly wsClient: CsgDeliveryWsClient,
        private readonly dispatcher: WithdrawalTrackingDispatcher,
    ) {
        wsClient.on(TRADE_STATUS, (updates: TradeStatusEvent) => this.handleUpdates(updates));
    }

    private handleUpdates(updates: TradeStatusEvent): Promise<void> {
        return updates
            .filter((update) => update.type === WITHDRAWAL)
            .reduce((previous, update) => previous.then(() => this.dispatch(update)), Promise.resolve());
    }

    private dispatch(update: TradeStatusUpdate): Promise<void> {
        return this.dispatcher.dispatchFor(this.wsClient.accountId, update.data);
    }
}
