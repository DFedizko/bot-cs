import type { AccountRepository } from "../../application/account.repository";
import { Account } from "../../domain/account/account";
import type { AccountId } from "../../domain/account/account-id";
import type { AccountRecord, AccountStoreInMemory } from "../stores/account.store.in-memory";

export class AccountRepositoryInMemory implements AccountRepository {
    constructor(private readonly store: AccountStoreInMemory) {}

    async findById(id: AccountId): Promise<Account | undefined> {
        const record = this.store.find(id.getValue());
        return record && this.mapToAccount(record);
    }

    async findMany(): Promise<Account[]> {
        return this.store.list().map((record) => this.mapToAccount(record));
    }

    async save(account: Account): Promise<void> {
        this.store.put({ ...account.toPrimitives(), balance: this.balanceOf(account) });
    }

    private mapToAccount({ id, name, totalAmount, reservations }: AccountRecord): Account {
        return Account.sync({ id, name, totalAmount, reservations });
    }

    private balanceOf(account: Account): AccountRecord["balance"] {
        return {
            total: account.getTotalAmount(),
            reserved: account.getReservedAmount(),
            available: account.getAvailableAmount(),
        };
    }
}
