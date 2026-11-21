import { DomainError } from "@/packages/error/domain-error";

export class WantedItemAlreadyExistsError extends DomainError {
    constructor(accountId: number, name: string) {
        super({
            message: `The account ${accountId} already wants "${name}"`,
            code: "WANTED_ITEM_ALREADY_EXISTS",
        });
    }
}
