import { BaseError } from "@/packages/building-blocks/base-error";

export class BidRejectedError extends BaseError {
    constructor(auctionId: number, bidValue: number, reason: string) {
        super({
            message: `The bid of ${bidValue} on auction "${auctionId}" was rejected: ${reason}`,
            code: "BID_REJECTED",
        });
    }
}
