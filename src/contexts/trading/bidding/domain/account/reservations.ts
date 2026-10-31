import { type Primitive, ValueObject } from "@/packages/building-blocks/value-object";
import { Money } from "@/packages/domain-primitives/money";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import { ReservationId } from "./reservation-id";
import { NonExistentReservationError } from "./errors/non-existent-reservation.error";

export type ReservationsPrimitives = Record<number, number>;

export class Reservations extends ValueObject<ReadonlyMap<Primitive<ReservationId>, Money>> {
    static empty(): Reservations {
        return new Reservations(new Map());
    }

    static create(reservations: ReservationsPrimitives): Reservations {
        const reservationsMap = new Map<number, Money>();
        for (const [key, value] of Object.entries(reservations)) {
            reservationsMap.set(new ReservationId(parseInt(key)).getValue(), CoinCent(value));
        }
        return new Reservations(reservationsMap);
    }

    reserveFor(reservationId: number, amount: number): Reservations {
        return new Reservations(new Map(this.value).set(new ReservationId(reservationId).getValue(), CoinCent(amount)));
    }

    refundFor(reservationId: number): Reservations {
        const reservationIdValue = new ReservationId(reservationId).getValue();
        const next = new Map(this.value);
        if (!next.get(reservationIdValue)) throw new NonExistentReservationError(reservationIdValue);
        next.delete(reservationIdValue);
        return new Reservations(next);
    }

    amountFor(reservationId: number) {
        const reservationIdValue = new ReservationId(reservationId).getValue();
        return this.value.get(reservationIdValue)?.getAmount() ?? 0;
    }

    getTotalReserved(): number {
        return [...this.value.values()].reduce((sum, money) => sum + money.getAmount(), 0);
    }
}
