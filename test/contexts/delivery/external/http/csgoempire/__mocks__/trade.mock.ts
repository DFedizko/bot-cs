import type { GetTrade, GetTradeWithdrawal } from "@/contexts/delivery/infrastructure/http/csgoempire/get-trade";
import type { MarkAsReceived } from "@/contexts/delivery/infrastructure/http/csgoempire/mark-as-received";
import type { DisputeTrade } from "@/contexts/delivery/infrastructure/http/csgoempire/dispute-trade";
import { TRADE_ID } from "@/contexts/delivery/domain/__builders__/delivery.builder";

export const sentWithdrawal = (overrides: Partial<GetTradeWithdrawal> = {}): GetTradeWithdrawal => ({
    id: 291452362,
    total_value: 700,
    item_id: 4209852853,
    status: 5,
    status_message: "Sent",
    tradeoffer_id: TRADE_ID,
    created_at: "2025-02-25 01:01:01",
    updated_at: "2025-02-25 02:02:02",
    ...overrides,
});

export const markAsReceivedSuccess = { success: true } satisfies MarkAsReceived.Response;
export const disputeTradeSuccess = { success: true } satisfies DisputeTrade.Response;
export const tradeBadRequest = {} satisfies MarkAsReceived.ErrorResponse;
export const tradeNotFound = {
    success: true,
    data: { bid: null, deposit: null, withdrawal: null },
} satisfies GetTrade.NotFoundResponse;
