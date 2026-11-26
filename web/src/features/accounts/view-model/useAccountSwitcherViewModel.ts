import type { Account } from "../model/account";
import type { AccountSummary } from "../model/account-summary";
import { summarizeAccount } from "../model/summarize-account";
import { useAccountsQuery } from "./queries/useAccountsQuery";
import { toQueryStatus } from "../model/to-query-status";
import type { QueryStatus } from "../model/to-query-status";

export type AccountChoice = AccountSummary & { isCurrent: boolean };

export type AccountSwitcherViewModel = {
    status: QueryStatus;
    current: AccountSummary | null;
    accounts: Array<AccountChoice>;
};

const NO_ACCOUNTS: Array<Account> = [];

export function useAccountSwitcherViewModel(accountId: string): AccountSwitcherViewModel {
    const query = useAccountsQuery();
    const accounts = query.data ?? NO_ACCOUNTS;
    const current = accounts.find(({ id }) => id === accountId);
    return {
        status: toQueryStatus(query),
        current: current ? summarizeAccount(current) : null,
        accounts: accounts.map((account) => ({ ...summarizeAccount(account), isCurrent: account.id === accountId })),
    };
}
