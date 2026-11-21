// Docs: https://docs.csgoempire.com/reference/mark-as-received.md, dispute-trade.md, get-trade.md, checked 2026-11-20.
import type { CsgDeliveryHttp } from "@/contexts/delivery/infrastructure/http/csgoempire/csg-delivery.http";
import type { DisputeTrade } from "@/contexts/delivery/infrastructure/http/csgoempire/dispute-trade";
import type { GetTrade, GetTradeWithdrawal } from "@/contexts/delivery/infrastructure/http/csgoempire/get-trade";
import type { MarkAsReceived } from "@/contexts/delivery/infrastructure/http/csgoempire/mark-as-received";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import { disputeTradeSuccess, markAsReceivedSuccess, sentWithdrawal, tradeNotFound } from "./__mocks__/trade.mock";

const COMPLETED = { status: 6, status_message: "Completed" } as const;
const DISPUTED = { status: 11, status_message: "Disputed" } as const;

type TradeStatusChange = Pick<GetTradeWithdrawal, "status" | "status_message">;

export class CsgDeliveryHttpFakeAdapter implements CsgDeliveryHttp {
    private readonly store: Map<number, GetTradeWithdrawal>;

    constructor(withdrawals: readonly GetTradeWithdrawal[] = [sentWithdrawal()]) {
        this.store = new Map(withdrawals.map((withdrawal) => [withdrawal.id, { ...withdrawal }]));
    }

    async markAsReceived(request: MarkAsReceived.Request): Promise<MarkAsReceived.Response> {
        this.updateByOffer(request.tradeoffer_id, COMPLETED);
        return { ...markAsReceivedSuccess };
    }

    async disputeTrade(request: DisputeTrade.Request): Promise<DisputeTrade.Response> {
        this.updateByOffer(request.tradeoffer_id, DISPUTED);
        return { ...disputeTradeSuccess };
    }

    async getTrade(request: GetTrade.Request): Promise<GetTrade.Response | GetTrade.NotFoundResponse> {
        const withdrawal = this.store.get(request.depositId);
        if (!withdrawal) return structuredClone(tradeNotFound);
        return { success: true, data: { ...withdrawal } };
    }

    private updateByOffer(tradeOfferId: number, change: TradeStatusChange): void {
        const withdrawal = [...this.store.values()].find((trade) => trade.tradeoffer_id === tradeOfferId);
        if (!withdrawal) throw new NotFoundError(`Trade offer "${tradeOfferId}" not found`);
        this.store.set(withdrawal.id, { ...withdrawal, ...change });
    }
}
