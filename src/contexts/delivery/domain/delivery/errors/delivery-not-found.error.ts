import { DomainError } from "@/packages/error/domain-error";

export class DeliveryNotFoundError extends DomainError {
    constructor(tradeId: number) {
        super({ message: `No delivery was found for the trade "${tradeId}"`, code: "DELIVERY_NOT_FOUND" });
    }
}
