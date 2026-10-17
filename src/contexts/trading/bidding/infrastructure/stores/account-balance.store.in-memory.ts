import type { AccountBalanceStore } from "../../application/stores/account-balance.store";
import { AccountBalance } from "../../domain/value-objects/account-balance";
import { FluentAccountBalance } from "../../domain/value-objects/fluent-account-balance";

type SyncProps = { total: number; reserved?: number };

export class AccountBalanceStoreInMemory implements AccountBalanceStore {
    private balance = new AccountBalance({ total: 0, reserved: 0, available: 0 });

    sync({ total, reserved = 0 }: SyncProps): void {
        const available = this.calculateAvailable(total, reserved);
        this.balance = new AccountBalance({ total, reserved, available });
    }

    reserve(amount: number): void {
        this.balance = new FluentAccountBalance(this.balance)
            .incrementReserved(amount)
            .decrementAvailable(amount)
            .getBalance();
    }

    credit(amount: number): void {
        this.balance = new FluentAccountBalance(this.balance)
            .incrementTotal(amount)
            .incrementAvailable(amount)
            .getBalance();
    }

    debit(amount: number): void {
        this.balance = new FluentAccountBalance(this.balance)
            .decrementTotal(amount)
            .decrementReserved(amount)
            .getBalance();
    }

    refund(amount: number): void {
        this.balance = new FluentAccountBalance(this.balance)
            .decrementReserved(amount)
            .incrementAvailable(amount)
            .getBalance();
    }

    getBalance(): AccountBalance {
        return this.balance;
    }

    private calculateAvailable(total: number, reserved: number): number {
        return total - reserved;
    }
}
