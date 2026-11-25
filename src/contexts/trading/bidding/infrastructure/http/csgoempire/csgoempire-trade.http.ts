import type { GetActiveTrades } from "./get-active-trades";
import type { CreateWithdrawal } from "./create-withdrawal";

export interface CsgoempireTradeHttp {
    getActiveTrades(): Promise<GetActiveTrades.Response>;
    createWithdrawal(request: CreateWithdrawal.Request): Promise<CreateWithdrawal.Response>;
}
