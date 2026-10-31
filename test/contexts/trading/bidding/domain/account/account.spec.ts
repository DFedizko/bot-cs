import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { InsufficientBalanceError } from "@/contexts/trading/bidding/domain/account/errors/insufficient-balance.error";

describe("Account", () => {
    it("Should syncrhonize an account", () => {
        const account = Account.sync({
            id: 1,
            name: "John Doe",
            totalAmount: 5000,
            reservations: { 2: 2000, 3: 3000 },
        });
        expect(account.getId()).toBe(1);
        expect(account.getName()).toBe("John Doe");
        expect(account.getTotalAmount()).toBe(5000);
        expect(account.getReservedAmount()).toBe(5000);
        expect(account.getAvailableAmount()).toBe(0);
    });
    it("Should verify if it's me", () => expect(Account.sync({ id: 123, name: "John Doe" }).isMe(123)).toBe(true));
    it("Should reserve amount for an item", () => {
        const account = Account.sync({ id: 1, name: "John Doe", totalAmount: 300, reservations: { 2: 200 } });
        expect(account.getAvailableAmount()).toBe(100);
        account.reserveFor(1, 100);
        expect(account.getTotalAmount()).toBe(300);
        expect(account.getReservedAmount()).toBe(300);
        expect(account.getAvailableAmount()).toBe(0);
    });
    it("Should refund a reserved amount", () => {
        const account = Account.sync({ id: 1, name: "John Doe", totalAmount: 100 });
        account.reserveFor(1, 100);
        account.refundFor(1);
        expect(account.getTotalAmount()).toBe(100);
        expect(account.getReservedAmount()).toBe(0);
        expect(account.getAvailableAmount()).toBe(100);
    });
    it("Should credit some amount", () => {
        const account = Account.sync({ id: 1, name: "John Doe", totalAmount: 10000 });
        account.credit(1200);
        expect(account.getTotalAmount()).toBe(11200);
        expect(account.getReservedAmount()).toBe(0);
        expect(account.getAvailableAmount()).toBe(11200);
    });
    it("Should debit reserved amount", () => {
        const account = Account.sync({ id: 1, name: "John Doe", totalAmount: 10000 });
        account.reserveFor(1, 600);
        account.reserveFor(2, 600);
        account.debitFor(1);
        expect(account.getTotalAmount()).toBe(9400);
        expect(account.getReservedAmount()).toBe(600);
        expect(account.getAvailableAmount()).toBe(8800);
    });
    it("Should check if account has a reservetion for an item id", () => {
        const account = Account.sync({ id: 1, name: "John Doe", totalAmount: 10000, reservations: { 1: 100 } });
        expect(account.hasReservationFor(1)).toBe(true);
        expect(account.hasReservationFor(2)).toBe(false);
    });
    it("Should throw insufficient balance error when synchronize account with more reserved amount than the total balance amount", () =>
        expect(() =>
            Account.sync({ id: 1, name: "John Doe", totalAmount: 4999, reservations: { 2: 2000, 3: 3000 } }),
        ).toThrow(InsufficientBalanceError));
    it("Should throw insufficient balance error when reserve amount with insufficient balance", () => {
        const account = Account.sync({ id: 1, name: "John Doe" });
        expect(() => account.reserveFor(1, 100)).toThrow(InsufficientBalanceError);
    });
});
