import type { GetActiveAuctions } from "./get-active-auctions";
import type { PlaceBid } from "./place-bid";

export interface CsgoempireAuctionHttp {
    getActiveAuctions(): Promise<GetActiveAuctions.Response>;
    placeBid(request: PlaceBid.Request): Promise<PlaceBid.Response>;
}
