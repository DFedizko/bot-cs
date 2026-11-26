import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWantedItemsService } from "../ports/wanted-items.service";
import { wantedItemsKey } from "../queries/wanted-items-key";

export function useRemoveWantedItemMutation(accountId: string) {
    const service = useWantedItemsService();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => service.remove(accountId, name),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: wantedItemsKey(accountId) }),
    });
}
