import { AccountBalance } from "./account-balance";

export class FluentAccountBalance {
    private total: number;
    private reserved: number;
    private available: number;

    constructor(accountBalance?: AccountBalance) {
        this.total = accountBalance?.getTotal() ?? 0;
        this.reserved = accountBalance?.getReserved() ?? 0;
        this.available = accountBalance?.getAvailable() ?? 0;
    }

    incrementTotal(amount: number): this {
        this.total += amount;
        return this;
    }

    incrementReserved(amount: number): this {
        this.reserved += amount;
        return this;
    }

    incrementAvailable(amount: number): this {
        this.available += amount;
        return this;
    }

    decrementTotal(amount: number): this {
        this.total -= amount;
        return this;
    }

    decrementReserved(amount: number): this {
        this.reserved -= amount;
        return this;
    }

    decrementAvailable(amount: number): this {
        this.available -= amount;
        return this;
    }

    getBalance(): AccountBalance {
        return new AccountBalance({ total: this.total, reserved: this.reserved, available: this.available });
    }
}
