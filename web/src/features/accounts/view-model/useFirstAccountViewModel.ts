import { useAccountsQuery } from "./queries/useAccountsQuery";
import { toQueryStatus } from "../model/to-query-status";

export type FirstAccountViewModel =
    { status: "loading" | "error" | "empty"; accountId?: never } | { status: "ready"; accountId: string };

export function useFirstAccountViewModel(): FirstAccountViewModel {
    const query = useAccountsQuery();
    const status = toQueryStatus(query);
    if (status !== "ready") return { status };
    const first = query.data?.at(0);
    return first ? { status, accountId: first.id } : { status: "empty" };
}
