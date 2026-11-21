import type { Logger } from "@/packages/application/logger";
import type { CsgTradesGateway, TradeStatusDTO } from "../../application/csg-trades.gateway";

export class CsgTradesGatewayDryRunAdapter implements CsgTradesGateway {
    constructor(
        private readonly gateway: CsgTradesGateway,
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
