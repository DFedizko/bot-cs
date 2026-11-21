import { DomainError } from "@/packages/error/domain-error";

export class WantedItemNotFoundError extends DomainError {
    constructor(accountId: number, name: string) {
        super({
            message: `The account ${accountId} doesn't want "${name}"`,
            code: "WANTED_ITEM_NOT_FOUND",
        });
    }
}
