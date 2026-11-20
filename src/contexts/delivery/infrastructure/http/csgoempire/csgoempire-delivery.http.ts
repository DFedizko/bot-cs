import type { DisputeTrade } from "./dispute-trade";
import type { GetTrade } from "./get-trade";
import type { MarkAsReceived } from "./mark-as-received";

export interface CsgoempireDeliveryHttp {
    markAsReceived(request: MarkAsReceived.Request): Promise<MarkAsReceived.Response>;
    disputeTrade(request: DisputeTrade.Request): Promise<DisputeTrade.Response>;
    getTrade(request: GetTrade.Request): Promise<GetTrade.Response | GetTrade.NotFoundResponse>;
}
