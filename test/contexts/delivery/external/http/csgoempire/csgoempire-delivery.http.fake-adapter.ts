// Docs: https://docs.csgoempire.com/reference/mark-as-received.md, dispute-trade.md, get-trade.md, checked 2026-11-20.
import type { CsgoempireDeliveryHttp } from "@/contexts/delivery/infrastructure/http/csgoempire/csgoempire-delivery.http";
import type { DisputeTrade } from "@/contexts/delivery/infrastructure/http/csgoempire/dispute-trade";
import type { GetTrade, GetTradeWithdrawal } from "@/contexts/delivery/infrastructure/http/csgoempire/get-trade";
import type { MarkAsReceived } from "@/contexts/delivery/infrastructure/http/csgoempire/mark-as-received";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import { disputeTradeSuccess, markAsReceivedSuccess, sentWithdrawal } from "./__mocks__/trade.mock";

const COMPLETED = { status: 6, status_message: "Completed" } as const;
const DISPUTED = { status: 11, status_message: "Disputed" } as const;

export class CsgoempireDeliveryHttpFakeAdapter implements CsgoempireDeliveryHttp {
    private readonly store: Map<number, GetTradeWithdrawal>;

    constructor(withdrawals: readonly GetTradeWithdrawal[] = [sentWithdrawal()]) {
        this.store = new Map(withdrawals.map((withdrawal) => [withdrawal.tradeoffer_id, { ...withdrawal }]));
    }

    async markAsReceived(request: MarkAsReceived.Request): Promise<MarkAsReceived.Response> {
        this.update(request.tradeoffer_id, COMPLETED);
        return { ...markAsReceivedSuccess };
    }

    async disputeTrade(request: DisputeTrade.Request): Promise<DisputeTrade.Response> {
        this.update(request.tradeoffer_id, DISPUTED);
        return { ...disputeTradeSuccess };
    }

    async getTrade(request: GetTrade.Request): Promise<GetTrade.Response> {
        return { success: true, data: { ...this.find(request.depositId) } };
    }

    private update(tradeId: number, status: Pick<GetTradeWithdrawal, "status" | "status_message">): void {
        this.store.set(tradeId, { ...this.find(tradeId), ...status });
    }

    private find(tradeId: number): GetTradeWithdrawal {
        const withdrawal = this.store.get(tradeId);
        if (!withdrawal) throw new NotFoundError(`Trade "${tradeId}" not found`);
        return withdrawal;
    }
}
