import { DomainError } from "@/packages/error/domain-error";
import type { DeliveryStatus } from "../delivery-status";

export class InvalidDeliveryTransitionError extends DomainError {
    constructor(from: DeliveryStatus, to: DeliveryStatus) {
        super({
            message: `A delivery can't go from "${from}" to "${to}"`,
            code: "INVALID_DELIVERY_TRANSITION",
        });
    }
}
