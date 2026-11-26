import { useQuery } from "@tanstack/react-query";
import type { Query } from "@tanstack/react-query";
import type { WantedItemsPage } from "../../model/wanted-items-page";
import type { WantedItemsQuery } from "../../model/wanted-items-query";
import { useWantedItemsService } from "../ports/wanted-items.service";
import { wantedItemsKey } from "./wanted-items-key";

const ACCOUNT_KEY_INDEX = 1;

const keepSameAccountPage =
    (accountId: string) =>
    (previous: WantedItemsPage | undefined, previousQuery: Query<WantedItemsPage> | undefined) =>
        previousQuery?.queryKey[ACCOUNT_KEY_INDEX] === accountId ? previous : undefined;

export function useWantedItemsQuery(accountId: string, query: WantedItemsQuery) {
    const service = useWantedItemsService();
    return useQuery({
        queryKey: [...wantedItemsKey(accountId), query],
        queryFn: () => service.list(accountId, query),
        placeholderData: keepSameAccountPage(accountId),
    });
}
