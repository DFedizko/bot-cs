import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddedWantedItem } from "../../model/added-wanted-item";
import type { NewWantedItem } from "../../model/new-wanted-item";
import { useWantedItemsService } from "../ports/wanted-items.service";
import { wantedItemsKey } from "../queries/wanted-items-key";

export function useAddWantedItemMutation(accountId: string) {
    const service = useWantedItemsService();
    const queryClient = useQueryClient();

    const pauseAdded = (name: string) =>
        service.setEnabled(accountId, name, false).then(
            () => true,
            () => false,
        );

    const addItem = async (item: NewWantedItem): Promise<AddedWantedItem> => {
        await service.add(accountId, item);
        return { paused: item.enabled || (await pauseAdded(item.name)) };
    };

    return useMutation({
        mutationFn: addItem,
        onSettled: () => queryClient.invalidateQueries({ queryKey: wantedItemsKey(accountId) }),
    });
}
