import { useQuery } from "@tanstack/react-query";
import { useAccountsService } from "../ports/accounts.service";
import { accountsQuery } from "./accounts-query";
import { toQueryStatus } from "./query-status";

export type FirstAccountViewModel =
    { status: "loading" | "error" | "empty"; accountId?: never } | { status: "ready"; accountId: string };

export function useFirstAccountViewModel(): FirstAccountViewModel {
    const query = useQuery(accountsQuery(useAccountsService()));
    const status = toQueryStatus(query);
    if (status !== "ready") return { status };
    const first = query.data?.at(0);
    return first ? { status, accountId: first.id } : { status: "empty" };
}
