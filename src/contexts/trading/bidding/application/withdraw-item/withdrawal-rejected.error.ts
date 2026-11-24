import { BaseError } from "@/packages/building-blocks/base-error";

export class WithdrawalRejectedError extends BaseError {
    constructor(itemId: number, coinValue: number, reason: string) {
        super({
            message: `The withdrawal of item "${itemId}" for ${coinValue} was rejected: ${reason}`,
            code: "WITHDRAWAL_REJECTED",
        });
    }
}
