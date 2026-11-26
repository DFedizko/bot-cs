import { useQuery } from "@tanstack/react-query";
import { useAccountsService } from "../ports/accounts.service";

const ACCOUNTS_QUERY_KEY = ["accounts"] as const;

export function useAccountsQuery() {
    const service = useAccountsService();
    return useQuery({ queryKey: ACCOUNTS_QUERY_KEY, queryFn: () => service.list() });
}
