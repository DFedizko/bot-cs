import type { DisputeTrade } from "./dispute-trade";
import type { GetActiveTrades } from "./get-active-trades";
import type { GetTrade } from "./get-trade";
import type { MarkAsReceived } from "./mark-as-received";

export interface CsgDeliveryHttp {
    markAsReceived(request: MarkAsReceived.Request): Promise<MarkAsReceived.Response>;
    disputeTrade(request: DisputeTrade.Request): Promise<DisputeTrade.Response>;
    getActiveTrades(): Promise<GetActiveTrades.Response>;
    getTrade(request: GetTrade.Request): Promise<GetTrade.Response | GetTrade.NotFoundResponse>;
}
