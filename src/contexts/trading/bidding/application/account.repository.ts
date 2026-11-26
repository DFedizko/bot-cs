import type { Account } from "../domain/account/account";
import type { AccountId } from "@/contexts/shared-kernel/domain/account-id";

export interface AccountRepository {
    findById(id: AccountId): Promise<Account | undefined>;
    findMany(): Promise<Account[]>;
    save(account: Account): Promise<void>;
}
