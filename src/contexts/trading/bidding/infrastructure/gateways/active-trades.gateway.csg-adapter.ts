import type { ActiveTradesDTO, ActiveTradesGateway } from "../../application/synchronize-account/active-trades.gateway";
import type { CsgoempireTradeHttp } from "../http/csgoempire/csgoempire-trade.http";

export class ActiveTradesGatewayCsgAdapter implements ActiveTradesGateway {
    constructor(private readonly csgoempireTradeHttp: CsgoempireTradeHttp) {}

    async getActiveTrades(): Promise<ActiveTradesDTO[]> {
        const response = await this.csgoempireTradeHttp.getActiveTrades();
        return response.data.withdrawals.map((withdraw) => ({ itemId: withdraw.item_id, value: withdraw.total_value }));
    }
}
