import type { AccountRepository } from "../../application/account.repository";
import type { Account } from "../../domain/account/account";
import type { AccountId } from "../../domain/account/account-id";
import type { Primitive } from "@/packages/building-blocks/value-object";

export class AccountRepositoryInMemory implements AccountRepository {
    private readonly store = new Map<Primitive<AccountId>, Account>();

    async findById(id: AccountId): Promise<Account | undefined> {
        return this.store.get(id.getValue());
    }

    async findMany(): Promise<Account[]> {
        return [...this.store.values()];
    }

    async save(account: Account): Promise<void> {
        this.store.set(account.getId(), account);
    }
}
