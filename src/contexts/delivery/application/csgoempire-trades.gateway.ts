export type TradeStatusDTO = { tradeId: number; status: string };

export interface CsgoempireTradesGateway {
    markAsReceived(tradeId: number): Promise<void>;
    dispute(tradeId: number): Promise<void>;
    getTradeStatus(tradeId: number): Promise<TradeStatusDTO>;
}
