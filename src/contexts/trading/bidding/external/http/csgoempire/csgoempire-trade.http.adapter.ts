import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { CsgoempireTradeHttp } from "../../../infrastructure/http/csgoempire/csgoempire-trade.http";
import type { GetActiveTrades } from "../../../infrastructure/http/csgoempire/get-active-trades";

export class CsgoempireTradeHttpAdapter implements CsgoempireTradeHttp {
    constructor(private readonly httpClient: HttpClient) {}

    async getActiveTrades(): Promise<GetActiveTrades.Response> {
        return await this.httpClient.get<GetActiveTrades.Response>("/trading/user/trades");
    }
}
