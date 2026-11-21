import type { TradeWithdrawal } from "../../http/csgoempire/types/trade-withdrawal";

export interface TradeStatusUpdate {
    type: "withdrawal" | (string & {});
    data: TradeWithdrawal;
}

export type TradeStatusEvent = TradeStatusUpdate[];
