import type { Logger } from "@/packages/application/logger";
import type { CsgoempireTradesGateway, TradeStatusDTO } from "../../application/csgoempire-trades.gateway";

export class CsgoempireTradesGatewayDryRunAdapter implements CsgoempireTradesGateway {
    constructor(
        private readonly gateway: CsgoempireTradesGateway,
        private readonly logger: Logger,
    ) {}

    async markAsReceived(tradeId: number): Promise<void> {
        this.logger.log(`[dry-run] Would mark trade "${tradeId}" as received`);
    }

    async dispute(tradeId: number): Promise<void> {
        this.logger.log(`[dry-run] Would dispute trade "${tradeId}"`);
    }

    getTradeStatus(tradeId: number): Promise<TradeStatusDTO> {
        return this.gateway.getTradeStatus(tradeId);
    }
}
