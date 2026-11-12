import type { CsgoempireAuctionHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-auction.http";
import { CsgoempireAuctionHttpFakeAdapter } from "./csgoempire-auction.http.fake-adapter";
import type { GetActiveAuctions } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/get-active-auctions";

let csgoempireAuctionHttp: CsgoempireAuctionHttp;
describe("CsgoempireAuctionHttp", () => {
    beforeEach(() => {
        csgoempireAuctionHttp = new CsgoempireAuctionHttpFakeAdapter();
    });

    it("Should get active auctions", async () => {
        const response = await csgoempireAuctionHttp.getActiveAuctions();
        expectTypeOf(response).toEqualTypeOf<GetActiveAuctions.Response>();
    });
});
