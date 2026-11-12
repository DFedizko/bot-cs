import type { CsgoempireTradeHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-trade.http";
import { GetActiveTrades } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/get-active-trades";
import { activeTrades } from "./__mocks__/active-trades.mock";

export class CsgoempireTradeHttpFakeAdapter implements CsgoempireTradeHttp {
    async getActiveTrades(): Promise<GetActiveTrades.Response> {
        return activeTrades;
    }
}
