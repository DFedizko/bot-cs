import type { Logger } from "@/packages/application/logger";
import type { CsgoempireTradesGateway, TradeStatusDTO } from "../../application/csgoempire-trades.gateway";

export class CsgoempireTradesGatewayDryRunAdapter implements CsgoempireTradesGateway {
    constructor(
        private readonly gateway: CsgoempireTradesGateway,
        private readonly logger: Logger,
    ) {}

    async markAsReceived(tradeOfferId: number): Promise<void> {
        this.logger.log(`[dry-run] Would mark trade offer "${tradeOfferId}" as received`);
    }

    async dispute(tradeOfferId: number): Promise<void> {
        this.logger.log(`[dry-run] Would dispute trade offer "${tradeOfferId}"`);
    }

    getTradeStatus(tradeId: number): Promise<TradeStatusDTO> {
        return this.gateway.getTradeStatus(tradeId);
    }
}
