import type { AccountBalanceStore } from "@/contexts/trading/bidding/application/stores/account-balance.store";
import { AccountBalanceStoreInMemory } from "@/contexts/trading/bidding/infrastructure/stores/account-balance.store.in-memory";

let accountBalanceStore: AccountBalanceStore;
describe("AccountBalanceStoreInMemory", () => {
    beforeEach(() => {
        accountBalanceStore = new AccountBalanceStoreInMemory();
    });

    it("Should synchronize balance from external", () => {
        accountBalanceStore.sync({ total: 10000 });
        const balance = accountBalanceStore.getBalance();
        expect(balance.getTotal()).toBe(10000);
        expect(balance.getReserved()).toBe(0);
        expect(balance.getAvailable()).toBe(10000);
    });
    it("Should synchronize balance from external with reserved amount", () => {
        accountBalanceStore.sync({ total: 10000, reserved: 900 });
        const balance = accountBalanceStore.getBalance();
        expect(balance.getTotal()).toBe(10000);
        expect(balance.getReserved()).toBe(900);
        expect(balance.getAvailable()).toBe(9100);
    });
    it("Should reserve some amount", () => {
        accountBalanceStore.sync({ total: 10000 });
        accountBalanceStore.reserve(900);
        const balance = accountBalanceStore.getBalance();
        expect(balance.getTotal()).toBe(10000);
        expect(balance.getReserved()).toBe(900);
        expect(balance.getAvailable()).toBe(9100);
    });
    it("Should credit some amount", () => {
        accountBalanceStore.sync({ total: 10000 });
        accountBalanceStore.credit(1200);
        const balance = accountBalanceStore.getBalance();
        expect(balance.getTotal()).toBe(11200);
        expect(balance.getReserved()).toBe(0);
        expect(balance.getAvailable()).toBe(11200);
    });
    it("Should debit some amount", () => {
        accountBalanceStore.sync({ total: 10000, reserved: 1200 });
        accountBalanceStore.debit(600);
        const balance = accountBalanceStore.getBalance();
        expect(balance.getTotal()).toBe(9400);
        expect(balance.getReserved()).toBe(600);
        expect(balance.getAvailable()).toBe(8800);
    });
    it("Should refund some amount", () => {
        accountBalanceStore.sync({ total: 10000, reserved: 1200 });
        accountBalanceStore.refund(600);
        const balance = accountBalanceStore.getBalance();
        expect(balance.getTotal()).toBe(10000);
        expect(balance.getReserved()).toBe(600);
        expect(balance.getAvailable()).toBe(9400);
    });
});
