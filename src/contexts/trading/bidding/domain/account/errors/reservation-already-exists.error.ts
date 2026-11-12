import { DomainError } from "@/packages/error/domain-error";

export class ReservationAlreadyExistsError extends DomainError {
    constructor(reservationId: number) {
        super({
            message: `Reservation with id: "${reservationId}" already exists`,
            code: "RESERVATION_ALREADY_EXISTS",
        });
    }
}
