import { DomainError } from "@/packages/error/domain-error";

export class InsufficientBalanceError extends DomainError {
    constructor(amount: number) {
        super({ message: `Insufficient balance for ${amount}`, code: "INSUFFICIENT_BALANCE" });
    }
}
