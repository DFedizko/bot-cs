import { NonExistentReservationError } from "@/contexts/trading/bidding/domain/account/errors/non-existent-reservation.error";
import { Reservations } from "@/contexts/trading/bidding/domain/account/reservations";

describe("Reservations", () => {
    it("Should create reservations object with reservations", () => {
        const reservations = Reservations.create({ 1: 100, 2: 200, 3: 150, 4: 1000 });
        expect(reservations.getTotalReserved()).toBe(1450);
        expect(reservations.amountFor(1)).toBe(100);
        expect(reservations.amountFor(2)).toBe(200);
        expect(reservations.amountFor(3)).toBe(150);
        expect(reservations.amountFor(4)).toBe(1000);
    });
    it("Should reserve amount", () => {
        const reservations = Reservations.empty().reserveFor(1, 100);
        const reservationsNotEmpty = Reservations.create({ 1: 100 }).reserveFor(2, 100);
        expect(reservations.getTotalReserved()).toBe(100);
        expect(reservations.amountFor(1)).toBe(100);
        expect(reservationsNotEmpty.getTotalReserved()).toBe(200);
        expect(reservationsNotEmpty.amountFor(1)).toBe(100);
        expect(reservationsNotEmpty.amountFor(2)).toBe(100);
    });
    it("Should refund amount", () => {
        const reservations = Reservations.create({ 1: 111100 }).refundFor(1);
        expect(reservations.getTotalReserved()).toBe(0);
        expect(reservations.amountFor(1)).toBe(0);
    });
    it("Should throw an error when refund amount with a non-existent reservation", () => {
        expect(() => Reservations.empty().refundFor(1)).toThrow(NonExistentReservationError);
    });
});
