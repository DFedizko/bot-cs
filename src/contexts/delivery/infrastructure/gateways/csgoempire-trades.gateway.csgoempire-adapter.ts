import type { CsgoempireTradesGateway, TradeStatusDTO } from "../../application/csgoempire-trades.gateway";
import type { CsgoempireDeliveryHttp } from "../http/csgoempire/csgoempire-delivery.http";

const WITHDRAWAL = "withdrawal";

export class CsgoempireTradesGatewayCsgoempireAdapter implements CsgoempireTradesGateway {
    constructor(private readonly http: CsgoempireDeliveryHttp) {}

    async markAsReceived(tradeId: number): Promise<void> {
        await this.http.markAsReceived({ tradeoffer_id: tradeId });
    }

    async dispute(tradeId: number): Promise<void> {
        await this.http.disputeTrade({ tradeoffer_id: tradeId });
    }

    async getTradeStatus(tradeId: number): Promise<TradeStatusDTO> {
        const { data } = await this.http.getTrade({ depositId: tradeId, type: WITHDRAWAL });
        return { tradeId: data.tradeoffer_id, status: data.status_message };
    }
}
