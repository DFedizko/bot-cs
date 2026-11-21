export type TradeStatusDTO = { tradeId: number; tradeOfferId: number; status: string };

export interface CsgTradesGateway {
    markAsReceived(tradeOfferId: number): Promise<void>;
    dispute(tradeOfferId: number): Promise<void>;
    getTradeStatus(tradeId: number): Promise<TradeStatusDTO>;
}
