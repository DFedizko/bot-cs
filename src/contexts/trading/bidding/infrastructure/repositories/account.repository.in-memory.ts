import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import type { AccountRepository } from "../../application/account.repository";
import type { Account } from "../../domain/account/account";
import type { AccountId } from "../../domain/account/account-id";
import type { Primitive } from "@/packages/building-blocks/value-object";

export class AccountRepositoryInMemory implements AccountRepository {
    private readonly store = new Map<Primitive<AccountId>, Account>();

    async findById(id: AccountId): Promise<Account> {
        const accountFound = this.store.get(id.getValue());
        if (!accountFound) throw new NotFoundError(`Account not found by the id "${id.getValue()}"`);
        return accountFound;
    }

    async save(account: Account): Promise<void> {
        this.store.set(account.getId(), account);
    }
}
