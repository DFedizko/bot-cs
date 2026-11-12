import type { CsgoempireTradeHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-trade.http";
import { CsgoempireTradeHttpFakeAdapter } from "./csgoempire-trade.http.fake-adapter";
import type { GetActiveTrades } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/get-active-trades";

let csgoempireTradeHttp: CsgoempireTradeHttp;
describe("CsgoempireTradeHttp", () => {
    beforeEach(() => {
        csgoempireTradeHttp = new CsgoempireTradeHttpFakeAdapter();
    });

    it("Should get active auctions", async () => {
        const response = await csgoempireTradeHttp.getActiveTrades();
        expectTypeOf(response).toEqualTypeOf<GetActiveTrades.Response>();
    });
});
