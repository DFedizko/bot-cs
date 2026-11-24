// Docs: https://docs.csgoempire.com/reference/create-withdrawal.md (400 body "{}") and
// getting-started-with-your-api.md (429 when rate limited), checked 2026-11-23.
import type { CsgoempireTradeHttp } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/csgoempire-trade.http";
import type {
    ActiveWithdrawal,
    GetActiveTrades,
} from "@/contexts/trading/bidding/infrastructure/http/csgoempire/get-active-trades";
import type { CreateWithdrawal } from "@/contexts/trading/bidding/infrastructure/http/csgoempire/create-withdrawal";
import { HttpError } from "@/packages/infrastructure/http/errors/http.error";
import { InternalServerError } from "@/packages/infrastructure/http/errors/internal-server.error";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { activeTrades } from "./__mocks__/active-trades.mock";
import { createWithdrawalBadRequest, createWithdrawalSuccess } from "./__mocks__/create-withdrawal.mock";

export type WithdrawFailure = "rate-limited" | "server-error" | "lost-response";

type WithdrawScenario = { withdrawFailure?: WithdrawFailure };

const LOST_RESPONSE_MESSAGE = "socket hang up";
const ONE_WITHDRAWAL = 1;
const WITHDRAWAL_TEMPLATE: ActiveWithdrawal = activeTrades.data.withdrawals[0];

export class CsgoempireTradeHttpFakeAdapter implements CsgoempireTradeHttp {
    private readonly withdrawals: ActiveWithdrawal[] = structuredClone(activeTrades.data.withdrawals);
    private createdCount = 0;

    constructor(private readonly scenario: WithdrawScenario = {}) {}

    async getActiveTrades(): Promise<GetActiveTrades.Response> {
        return {
            success: true,
            data: {
                deposits: structuredClone(activeTrades.data.deposits),
                withdrawals: structuredClone(this.withdrawals),
            },
        };
    }

    async createWithdrawal(request: CreateWithdrawal.Request): Promise<CreateWithdrawal.Response> {
        this.refuseBeforeWithdrawing();
        if (this.isWithdrawn(request.deposit_id)) throw this.badRequest();
        const withdrawal = this.recordWithdrawal(request);
        if (this.scenario.withdrawFailure === "lost-response") throw new HttpError({ message: LOST_RESPONSE_MESSAGE });
        return { success: true, data: { id: withdrawal.id, tradeoffer_id: withdrawal.tradeoffer_id } };
    }

    private refuseBeforeWithdrawing(): void {
        if (this.scenario.withdrawFailure === "rate-limited")
            throw new HttpError({ code: "TOO_MANY_REQUESTS", status: HttpStatus.TOO_MANY_REQUESTS });
        if (this.scenario.withdrawFailure === "server-error") throw new InternalServerError();
    }

    private isWithdrawn(itemId: number): boolean {
        return this.withdrawals.some((withdrawal) => withdrawal.item_id === itemId);
    }

    private badRequest(): HttpError {
        return new HttpError({
            message: JSON.stringify(createWithdrawalBadRequest),
            code: "BAD_REQUEST",
            status: HttpStatus.BAD_REQUEST,
        });
    }

    private recordWithdrawal({ deposit_id, coin_value }: CreateWithdrawal.Request): ActiveWithdrawal {
        this.createdCount += ONE_WITHDRAWAL;
        const offset = this.createdCount;
        const template = structuredClone(WITHDRAWAL_TEMPLATE);
        const withdrawal: ActiveWithdrawal = {
            ...template,
            id: createWithdrawalSuccess.data.id + offset,
            tradeoffer_id: createWithdrawalSuccess.data.tradeoffer_id + offset,
            item_id: deposit_id,
            total_value: coin_value,
            item: { ...template.item, id: deposit_id },
        };
        this.withdrawals.push(withdrawal);
        return withdrawal;
    }
}
