import type { CreateWithdrawal } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/create-withdrawal";

export const createWithdrawalRequest = {
    deposit_id: 28396506,
    coin_value: 3656,
} satisfies CreateWithdrawal.Request;

export const createWithdrawalSuccess = {
    success: true,
    data: {
        id: 26124023,
        tradeoffer_id: 298883412,
    },
} satisfies CreateWithdrawal.Response;

export const createWithdrawalBadRequest = {} satisfies CreateWithdrawal.ErrorResponse;
