import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { CsgoempireAuctionHttp } from "../../../infrastructure/http/csgoempire/csgoempire-auction.http";
import type { GetActiveAuctions } from "../../../infrastructure/http/csgoempire/get-active-auctions";
import type { PlaceBid } from "../../../infrastructure/http/csgoempire/place-bid";

export class CsgoempireAuctionHttpAdapter implements CsgoempireAuctionHttp {
    constructor(private readonly httpClient: HttpClient) {}

    async getActiveAuctions(): Promise<GetActiveAuctions.Response> {
        return this.httpClient.get<GetActiveAuctions.Response>("/trading/user/auctions");
    }

    async placeBid({ deposit_id, bid_value }: PlaceBid.Request): Promise<PlaceBid.Response> {
        return this.httpClient.post<PlaceBid.Response, PlaceBid.Body>(`/trading/deposit/${deposit_id}/bid`, {
            body: { bid_value },
        });
    }
}
