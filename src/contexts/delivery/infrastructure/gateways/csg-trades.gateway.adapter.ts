import type { CsgTradesGateway, TradeStatusDTO } from "../../application/csg-trades.gateway";
import { TradeNotFoundError } from "./errors/trade-not-found.error";
import type { CsgDeliveryHttp } from "../http/csgoempire/csg-delivery.http";

const WITHDRAWAL = "withdrawal";

export class CsgTradesGatewayAdapter implements CsgTradesGateway {
    constructor(private readonly http: CsgDeliveryHttp) {}

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
