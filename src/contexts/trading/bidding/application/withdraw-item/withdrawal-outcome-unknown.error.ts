import { BaseError } from "@/packages/building-blocks/base-error";

export class WithdrawalOutcomeUnknownError extends BaseError {
    constructor(itemId: number, coinValue: number, reason: string) {
        super({
            message: `It's unknown whether item "${itemId}" was withdrawn for ${coinValue}: ${reason}`,
            code: "WITHDRAWAL_OUTCOME_UNKNOWN",
        });
    }
}
