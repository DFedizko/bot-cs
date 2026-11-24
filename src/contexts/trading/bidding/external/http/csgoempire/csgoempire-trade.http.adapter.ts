import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { CsgoempireTradeHttp } from "../../../infrastructure/http/csgoempire/csgoempire-trade.http";
import type { GetActiveTrades } from "../../../infrastructure/http/csgoempire/get-active-trades";
import type { CreateWithdrawal } from "../../../infrastructure/http/csgoempire/create-withdrawal";

export class CsgoempireTradeHttpAdapter implements CsgoempireTradeHttp {
    constructor(private readonly httpClient: HttpClient) {}

    async getActiveTrades(): Promise<GetActiveTrades.Response> {
        return await this.httpClient.get<GetActiveTrades.Response>("/trading/user/trades");
    }

    async createWithdrawal({ deposit_id, coin_value }: CreateWithdrawal.Request): Promise<CreateWithdrawal.Response> {
        return this.httpClient.post<CreateWithdrawal.Response, CreateWithdrawal.Body>(
            `/trading/deposit/${deposit_id}/withdraw`,
            { body: { coin_value } },
        );
    }
}
