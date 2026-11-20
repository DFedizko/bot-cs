import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { CsgoempireDeliveryHttp } from "../../../infrastructure/http/csgoempire/csgoempire-delivery.http";
import type { DisputeTrade } from "../../../infrastructure/http/csgoempire/dispute-trade";
import type { GetTrade } from "../../../infrastructure/http/csgoempire/get-trade";
import type { MarkAsReceived } from "../../../infrastructure/http/csgoempire/mark-as-received";

export class CsgoempireDeliveryHttpAdapter implements CsgoempireDeliveryHttp {
    constructor(private readonly httpClient: HttpClient) {}

    markAsReceived(request: MarkAsReceived.Request): Promise<MarkAsReceived.Response> {
        return this.httpClient.post<MarkAsReceived.Response>(`/trading/deposit/${request.tradeoffer_id}/received`);
    }

    disputeTrade(request: DisputeTrade.Request): Promise<DisputeTrade.Response> {
        return this.httpClient.post<DisputeTrade.Response>(`/trading/deposit/${request.tradeoffer_id}/dispute`);
    }

    getTrade(request: GetTrade.Request): Promise<GetTrade.Response | GetTrade.NotFoundResponse> {
        return this.httpClient.get<GetTrade.Response | GetTrade.NotFoundResponse>(
            `/trading/user/trade/${request.depositId}/${request.type}`,
        );
    }
}
