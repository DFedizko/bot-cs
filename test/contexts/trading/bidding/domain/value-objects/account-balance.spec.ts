import { AccountBalance } from "@/contexts/trading/bidding/domain/value-objects/account-balance";

test("Should create a account balance", () => {
    const accountBalance = new AccountBalance({ total: 10000, reserved: 0, available: 10000 });
    expect(accountBalance.getTotal()).toBe(10000);
    expect(accountBalance.getAvailable()).toBe(10000);
    expect(accountBalance.getReserved()).toBe(0);
});
test("Should verify if has sufficient balance to place a bid", () => {
    const accountBalance = new AccountBalance({ total: 10000, reserved: 1000, available: 9000 });
    expect(accountBalance.covers(10000)).toBe(false);
    expect(accountBalance.covers(9000)).toBe(true);
    expect(accountBalance.covers(8999)).toBe(true);
});
