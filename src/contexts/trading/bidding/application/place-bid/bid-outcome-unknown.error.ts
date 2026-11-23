import { BaseError } from "@/packages/building-blocks/base-error";

export class BidOutcomeUnknownError extends BaseError {
    constructor(auctionId: number, bidValue: number, reason: string) {
        super({
            message: `It's unknown whether the bid of ${bidValue} on auction "${auctionId}" was placed: ${reason}`,
            code: "BID_OUTCOME_UNKNOWN",
        });
    }
}
