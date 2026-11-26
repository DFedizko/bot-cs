import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { WantedItemsQuery } from "../model/wanted-items-query";
import type { WantedItemsService } from "../ports/wanted-items.service";

export const wantedItemsKey = (accountId: string) => ["wanted-items", accountId] as const;

export const wantedItemsQuery = (service: WantedItemsService, accountId: string, query: WantedItemsQuery) =>
    queryOptions({
        queryKey: [...wantedItemsKey(accountId), query],
        queryFn: () => service.list(accountId, query),
        placeholderData: keepPreviousData,
    });
