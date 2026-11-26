import { queryOptions } from "@tanstack/react-query";
import type { AccountsService } from "./ports/accounts.service";

export const ACCOUNTS_QUERY_KEY = ["accounts"] as const;

export const accountsQuery = (service: AccountsService) =>
    queryOptions({ queryKey: ACCOUNTS_QUERY_KEY, queryFn: () => service.list() });
