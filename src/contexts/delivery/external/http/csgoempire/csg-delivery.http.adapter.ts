import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { CsgDeliveryHttp } from "../../../infrastructure/http/csgoempire/csg-delivery.http";
import type { DisputeTrade } from "../../../infrastructure/http/csgoempire/dispute-trade";
import type { GetActiveTrades } from "../../../infrastructure/http/csgoempire/get-active-trades";
import type { GetTrade } from "../../../infrastructure/http/csgoempire/get-trade";
import type { MarkAsReceived } from "../../../infrastructure/http/csgoempire/mark-as-received";

const ACTIVE_TRADES_PATH = "/trading/user/trades";

export class CsgDeliveryHttpAdapter implements CsgDeliveryHttp {
    constructor(private readonly httpClient: HttpClient) {}

    markAsReceived(request: MarkAsReceived.Request): Promise<MarkAsReceived.Response> {
        return this.httpClient.post<MarkAsReceived.Response>(`/trading/deposit/${request.tradeoffer_id}/received`);
    }

    disputeTrade(request: DisputeTrade.Request): Promise<DisputeTrade.Response> {
        return this.httpClient.post<DisputeTrade.Response>(`/trading/deposit/${request.tradeoffer_id}/dispute`);
    }

    getActiveTrades(): Promise<GetActiveTrades.Response> {
        return this.httpClient.get<GetActiveTrades.Response>(ACTIVE_TRADES_PATH);
    }

    getTrade(request: GetTrade.Request): Promise<GetTrade.Response | GetTrade.NotFoundResponse> {
        return this.httpClient.get<GetTrade.Response | GetTrade.NotFoundResponse>(
            `/trading/user/trade/${request.depositId}/${request.type}`,
        );
    }
}
