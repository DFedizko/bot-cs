import { DomainError } from "@/packages/error/domain-error";

export class AccountNotFoundError extends DomainError {
    constructor(accountId: number) {
        super({ message: `Account not found by the id "${accountId}"`, code: "ACCOUNT_NOT_FOUND" });
    }
}
