import type { Account } from "../domain/account/account";
import type { AccountId } from "../domain/account/account-id";

export interface AccountRepository {
    findById(id: AccountId): Promise<Account>;
    save(account: Account): Promise<void>;
}
