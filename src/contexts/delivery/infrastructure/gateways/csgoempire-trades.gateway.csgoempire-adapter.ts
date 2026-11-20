import type { CsgoempireTradesGateway, TradeStatusDTO } from "../../application/csgoempire-trades.gateway";
import { TradeNotFoundError } from "../../application/trade-not-found.error";
import type { CsgoempireDeliveryHttp } from "../http/csgoempire/csgoempire-delivery.http";

const WITHDRAWAL = "withdrawal";

export class CsgoempireTradesGatewayCsgoempireAdapter implements CsgoempireTradesGateway {
    constructor(private readonly http: CsgoempireDeliveryHttp) {}

    async markAsReceived(tradeOfferId: number): Promise<void> {
        await this.http.markAsReceived({ tradeoffer_id: tradeOfferId });
    }

    async dispute(tradeOfferId: number): Promise<void> {
        await this.http.disputeTrade({ tradeoffer_id: tradeOfferId });
    }

    async getTradeStatus(tradeId: number): Promise<TradeStatusDTO> {
        const { data } = await this.http.getTrade({ depositId: tradeId, type: WITHDRAWAL });
        if (!("status_message" in data)) throw new TradeNotFoundError(tradeId);
        return { tradeId: data.id, tradeOfferId: data.tradeoffer_id, status: data.status_message };
    }
}
