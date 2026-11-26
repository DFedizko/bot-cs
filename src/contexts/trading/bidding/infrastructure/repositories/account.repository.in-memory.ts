import type { AccountRepository } from "../../application/account.repository";
import type { Account } from "../../domain/account/account";
import type { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import type { Primitive } from "@/packages/building-blocks/value-object";
import type { AccountRecord, AccountStoreInMemory } from "../stores/account.store.in-memory";

export class AccountRepositoryInMemory implements AccountRepository {
    private readonly accounts = new Map<Primitive<AccountId>, Account>();

    constructor(private readonly store: AccountStoreInMemory) {}

    async findById(id: AccountId): Promise<Account | undefined> {
        return this.accounts.get(id.getValue());
    }

    async findMany(): Promise<Account[]> {
        return [...this.accounts.values()];
    }

    async save(account: Account): Promise<void> {
        this.accounts.set(account.getId(), account);
        this.store.put(this.mapToRecord(account));
    }

    private mapToRecord(account: Account): AccountRecord {
        return {
            ...account.toPrimitives(),
            balance: {
                total: account.getTotalAmount(),
                reserved: account.getReservedAmount(),
                available: account.getAvailableAmount(),
            },
        };
    }
}
