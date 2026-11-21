import { DomainError } from "@/packages/error/domain-error";

export class EmptyWantedItemChangesError extends DomainError {
    constructor() {
        super({ message: "A wanted item edit needs a max for or criteria", code: "EMPTY_WANTED_ITEM_CHANGES" });
    }
}
