import { useRemoveWantedItemMutation } from "./mutations/useRemoveWantedItemMutation";
import { useRemoveWantedItemStore } from "./ports/store/remove-wanted-item.store";

type PauseItem = (name: string, enabled: boolean) => void;

export function useRemoveWantedItemViewModel(accountId: string, pauseItem: PauseItem) {
    const removing = useRemoveWantedItemStore((state) => state.item);
    const startRemoving = useRemoveWantedItemStore((state) => state.startRemoving);
    const stopRemoving = useRemoveWantedItemStore((state) => state.stopRemoving);
    const { mutate, isPending, isError, reset } = useRemoveWantedItemMutation(accountId);

    const cancelRemoving = () => {
        reset();
        stopRemoving();
    };

    const confirmRemoving = () => {
        if (removing) mutate(removing.name, { onSuccess: cancelRemoving });
    };

    const pauseInstead = () => {
        if (removing) pauseItem(removing.name, false);
        cancelRemoving();
    };

    return {
        removing,
        removePending: isPending,
        removeFailed: isError,
        startRemoving,
        cancelRemoving,
        confirmRemoving,
        pauseInstead,
    };
}
