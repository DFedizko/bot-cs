import { DomainError } from "@/packages/error/domain-error";

export class MissingAcceptedOfferError extends DomainError {
    constructor(tradeId: number) {
        super({ message: `The delivery of trade "${tradeId}" has no accepted offer`, code: "MISSING_ACCEPTED_OFFER" });
    }
}
