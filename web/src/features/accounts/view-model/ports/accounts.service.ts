import { definePort } from "@/shared/lib/define-port";
import type { Account } from "../../model/account";

const ACCOUNTS_SERVICE_PORT = "AccountsService";

export interface AccountsService {
    list: () => Promise<Array<Account>>;
}

export const { Provider: AccountsServiceProvider, usePort: useAccountsService } =
    definePort<AccountsService>(ACCOUNTS_SERVICE_PORT);
