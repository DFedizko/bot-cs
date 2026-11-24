import type { WithdrawalDTO, WithdrawalGateway } from "../../application/withdraw-item/withdrawal.gateway";
import type { Logger } from "@/packages/application/logger";

const DRY_RUN_TRADE_ID = 0;
const DRY_RUN_TRADE_OFFER_ID = 0;

export class WithdrawalGatewayDryRunAdapter implements WithdrawalGateway {
    constructor(
        private readonly withdrawalGateway: WithdrawalGateway,
        private readonly logger: Logger,
    ) {}

    findWithdrawal(itemId: number): Promise<WithdrawalDTO | undefined> {
        return this.withdrawalGateway.findWithdrawal(itemId);
    }

    async withdraw(itemId: number, coinValue: number): Promise<WithdrawalDTO> {
        this.logger.log(`Dry run: skipped a withdrawal of item "${itemId}" for ${coinValue}`);
        return { tradeId: DRY_RUN_TRADE_ID, tradeOfferId: DRY_RUN_TRADE_OFFER_ID, itemId, value: coinValue };
    }
}
