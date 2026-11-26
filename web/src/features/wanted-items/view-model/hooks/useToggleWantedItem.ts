import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { setWantedItemEnabled } from "../../model/set-wanted-item-enabled";
import type { WantedItemsPage } from "../../model/wanted-items-page";
import { useWantedItemsService } from "../../ports/wanted-items.service";
import { wantedItemsKey } from "../wanted-items-query";

type Toggle = { name: string; enabled: boolean };
type Snapshot = Array<[QueryKey, WantedItemsPage | undefined]>;

export function useToggleWantedItem(accountId: string) {
    const service = useWantedItemsService();
    const queryClient = useQueryClient();
    const queryKey = wantedItemsKey(accountId);

    const applyOptimistically = async ({ name, enabled }: Toggle): Promise<Snapshot> => {
        await queryClient.cancelQueries({ queryKey });
        const snapshot = queryClient.getQueriesData<WantedItemsPage>({ queryKey });
        queryClient.setQueriesData<WantedItemsPage>({ queryKey }, (page) =>
            page ? setWantedItemEnabled(page, name, enabled) : page,
        );
        return snapshot;
    };

    const rollBack = (snapshot: Snapshot | undefined) =>
        snapshot?.forEach(([key, page]) => queryClient.setQueryData(key, page));

    return useMutation({
        mutationFn: ({ name, enabled }: Toggle) => service.setEnabled(accountId, name, enabled),
        onMutate: applyOptimistically,
        onError: (_error, _toggle, snapshot) => rollBack(snapshot),
        onSettled: () => queryClient.invalidateQueries({ queryKey }),
    });
}
