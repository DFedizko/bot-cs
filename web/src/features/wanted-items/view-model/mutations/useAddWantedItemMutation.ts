import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NewWantedItem } from "../../model/new-wanted-item";
import { useWantedItemsService } from "../ports/wanted-items.service";
import { wantedItemsKey } from "../queries/wanted-items-key";

export function useAddWantedItemMutation(accountId: string) {
    const service = useWantedItemsService();
    const queryClient = useQueryClient();

    const addItem = async (item: NewWantedItem) => {
        await service.add(accountId, item);
        if (!item.enabled) await service.setEnabled(accountId, item.name, false);
    };

    return useMutation({
        mutationFn: addItem,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: wantedItemsKey(accountId) }),
    });
}
