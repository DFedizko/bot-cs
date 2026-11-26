import { queryOptions } from "@tanstack/react-query";
import type { Query } from "@tanstack/react-query";
import type { WantedItemsPage } from "../model/wanted-items-page";
import type { WantedItemsQuery } from "../model/wanted-items-query";
import type { WantedItemsService } from "./ports/wanted-items.service";

const ACCOUNT_KEY_INDEX = 1;

export const wantedItemsKey = (accountId: string) => ["wanted-items", accountId] as const;

const keepSameAccountPage =
    (accountId: string) =>
    (previous: WantedItemsPage | undefined, previousQuery: Query<WantedItemsPage> | undefined) =>
        previousQuery?.queryKey[ACCOUNT_KEY_INDEX] === accountId ? previous : undefined;

export const wantedItemsQuery = (service: WantedItemsService, accountId: string, query: WantedItemsQuery) =>
    queryOptions({
        queryKey: [...wantedItemsKey(accountId), query],
        queryFn: () => service.list(accountId, query),
        placeholderData: keepSameAccountPage(accountId),
    });
