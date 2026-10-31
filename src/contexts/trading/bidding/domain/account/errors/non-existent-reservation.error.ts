import { DomainError } from "@/packages/error/domain-error";

export class NonExistentReservationError extends DomainError {
    constructor(itemId: number) {
        super({ message: `Reservation with id: "${itemId}" does not exist`, code: "NON_EXISTENT_RESERVATION" });
    }
}
