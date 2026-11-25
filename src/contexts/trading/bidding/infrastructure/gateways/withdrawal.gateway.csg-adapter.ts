import type { WithdrawalDTO, WithdrawalGateway } from "../../application/withdraw-item/withdrawal.gateway";
import { WithdrawalRejectedError } from "../../application/withdraw-item/withdrawal-rejected.error";
import { WithdrawalOutcomeUnknownError } from "../../application/withdraw-item/withdrawal-outcome-unknown.error";
import type { CsgoempireTradeHttp } from "../http/csgoempire/csgoempire-trade.http";
import type { CreateWithdrawal } from "../http/csgoempire/create-withdrawal";
import type { ActiveWithdrawal } from "../http/csgoempire/get-active-trades";
import { HttpError } from "@/packages/infrastructure/http/errors/http.error";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";

const UNKNOWN_REASON = "unknown error";
const REFUSAL_STATUSES: readonly HttpStatus[] = [HttpStatus.BAD_REQUEST, HttpStatus.TOO_MANY_REQUESTS];

export class WithdrawalGatewayCsgAdapter implements WithdrawalGateway {
    constructor(private readonly csgoempireTradeHttp: CsgoempireTradeHttp) {}

    async withdraw(itemId: number, coinValue: number): Promise<WithdrawalDTO> {
        const { data } = await this.requestWithdrawal(itemId, coinValue);
        return { tradeId: data.id, tradeOfferId: data.tradeoffer_id, itemId, value: coinValue };
    }

    async findWithdrawal(itemId: number): Promise<WithdrawalDTO | undefined> {
        const { data } = await this.csgoempireTradeHttp.getActiveTrades();
        const withdrawal = data.withdrawals.find((active) => active.item_id === itemId);
        return withdrawal && this.mapToDto(withdrawal);
    }

    private async requestWithdrawal(itemId: number, coinValue: number): Promise<CreateWithdrawal.Response> {
        try {
            return await this.csgoempireTradeHttp.createWithdrawal({ deposit_id: itemId, coin_value: coinValue });
        } catch (error: unknown) {
            throw this.classifyError(error, itemId, coinValue);
        }
    }

    private classifyError(error: unknown, itemId: number, coinValue: number): Error {
        const reason = error instanceof Error ? error.message : UNKNOWN_REASON;
        if (this.isRefusedRequest(error)) return new WithdrawalRejectedError(itemId, coinValue, reason);
        return new WithdrawalOutcomeUnknownError(itemId, coinValue, reason);
    }

    private isRefusedRequest(error: unknown): boolean {
        return error instanceof HttpError && REFUSAL_STATUSES.includes(error.httpStatus);
    }

    private mapToDto(withdrawal: ActiveWithdrawal): WithdrawalDTO {
        return {
            tradeId: withdrawal.id,
            tradeOfferId: withdrawal.tradeoffer_id,
            itemId: withdrawal.item_id,
            value: withdrawal.total_value,
        };
    }
}
