import type { AccountsDao } from "../../application/list-accounts/accounts.dao";
import type { AccountDto, ListAccountsResponse } from "../../application/list-accounts/list-accounts.response";
import type { AccountRecord, AccountStoreInMemory } from "../stores/account.store.in-memory";

export class AccountsDaoInMemory implements AccountsDao {
    constructor(private readonly store: AccountStoreInMemory) {}

    async list(): Promise<ListAccountsResponse> {
        return { items: this.store.list().map((record) => this.mapToDto(record)) };
    }

    private mapToDto({ id, name, balance }: AccountRecord): AccountDto {
        return { id: String(id), name, balance: { ...balance } };
    }
}
