import type { GetActiveTrades } from "./get-active-trades";

export interface CsgoempireTradeHttp {
    getActiveTrades(): Promise<GetActiveTrades.Response>;
}
