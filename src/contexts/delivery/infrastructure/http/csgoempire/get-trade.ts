import type { TradeStatus, TradeStatusMessage } from "./types/trade-status";

export namespace GetTrade {
    export interface Request {
        depositId: number;
        type: "withdrawal";
    }
    export interface Response {
        success: true;
        data: GetTradeWithdrawal;
    }
    export interface NotFoundResponse {
        success: true;
        data: { bid: null; deposit: null; withdrawal: null };
    }
}

export interface GetTradeWithdrawal {
    id: number;
    total_value: number;
    item_id: number;
    status: TradeStatus;
    status_message: TradeStatusMessage;
    tradeoffer_id: number;
    created_at: string;
    updated_at: string;
}
