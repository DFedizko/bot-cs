import type { ListAccountsResponse } from "./list-accounts.response";

export interface AccountsDao {
    list(): Promise<ListAccountsResponse>;
}
