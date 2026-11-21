import type { Logger } from "@/packages/application/logger";
import type { CsgDeliveryHttp } from "../http/csgoempire/csg-delivery.http";
import type { TradeWithdrawal } from "../http/csgoempire/types/trade-withdrawal";
import type { WithdrawalTrackingDispatcher } from "./withdrawal-tracking.dispatcher";

export class ActiveWithdrawalsStartupController {
    constructor(
        private readonly http: CsgDeliveryHttp,
        private readonly dispatcher: WithdrawalTrackingDispatcher,
        private readonly logger: Logger,
    ) {}

    async resume(accountId: number): Promise<void> {
        try {
            const { data } = await this.http.getActiveTrades();
            await this.dispatchAll(accountId, data.withdrawals);
        } catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            this.logger.log(`Could not resume the deliveries of account "${accountId}": ${reason}`);
        }
    }

    private dispatchAll(accountId: number, withdrawals: TradeWithdrawal[]): Promise<void> {
        return withdrawals.reduce(
            (previous, withdrawal) => previous.then(() => this.dispatcher.dispatchFor(accountId, withdrawal)),
            Promise.resolve(),
        );
    }
}
