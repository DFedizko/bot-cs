import type { CommandBus } from "@/packages/application/command-bus";
import type { Logger } from "@/packages/application/logger";
import { CS_APP_ID } from "@/contexts/shared-kernel/domain/cs-app-id";
import { StartDeliveryCommand } from "../../application/start-delivery/start-delivery.command";
import { TrackDeliveryCommand } from "../../application/track-delivery/track-delivery.command";
import { StopDeliveryTrackingCommand } from "../../application/stop-delivery-tracking/stop-delivery-tracking.command";
import type { TradeStatusMessage } from "../http/csgoempire/types/trade-status";
import type { TradeWithdrawal } from "../http/csgoempire/types/trade-withdrawal";

const SENT: TradeStatusMessage = "Sent";
const TERMINAL_STATUSES: readonly TradeStatusMessage[] = ["Completed", "Declined", "Canceled", "Timed Out", "Disputed"];

export class WithdrawalTrackingDispatcher {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly logger: Logger,
    ) {}

    async dispatchFor(accountId: number, withdrawal: TradeWithdrawal): Promise<void> {
        try {
            await this.dispatchByStatus(accountId, withdrawal);
        } catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            this.logger.log(`Could not handle trade "${withdrawal.id}" of account "${accountId}": ${reason}`);
        }
    }

    private dispatchByStatus(accountId: number, withdrawal: TradeWithdrawal): Promise<void> {
        if (withdrawal.status_message === SENT) return this.startTracking(accountId, withdrawal);
        if (TERMINAL_STATUSES.includes(withdrawal.status_message)) return this.stopTracking(accountId, withdrawal);
        return Promise.resolve();
    }

    private async startTracking(accountId: number, withdrawal: TradeWithdrawal): Promise<void> {
        const assetId = withdrawal.item.asset_id;
        if (assetId === undefined)
            return this.logger.log(`Not tracking trade "${withdrawal.id}": csgoempire sent no asset id to verify`);
        await this.commandBus.dispatch(this.startCommand(accountId, withdrawal, String(assetId)));
        await this.commandBus.dispatch(new TrackDeliveryCommand(withdrawal.id));
    }

    private stopTracking(accountId: number, withdrawal: TradeWithdrawal): Promise<void> {
        return this.commandBus.dispatch(
            new StopDeliveryTrackingCommand({ tradeId: withdrawal.id, accountId, reason: withdrawal.status_message }),
        );
    }

    private startCommand(accountId: number, withdrawal: TradeWithdrawal, assetId: string): StartDeliveryCommand {
        return new StartDeliveryCommand({
            tradeId: withdrawal.id,
            tradeOfferId: withdrawal.tradeoffer_id,
            accountId,
            assetId,
            marketName: withdrawal.item.market_name,
            appId: CS_APP_ID,
            sellerSteamId: withdrawal.metadata.partner?.steam_id,
        });
    }
}
