import { describePercentage } from "../model/describe-percentage";
import { isAlreadyWanted } from "../model/is-already-wanted";
import { toCatalogItemView } from "../model/to-catalog-item-view";
import { toNewWantedItem } from "../model/to-new-wanted-item";
import { validateMax } from "../model/validate-max";
import { useAddWantedItemMutation } from "./mutations/useAddWantedItemMutation";
import { useAddWantedItemStore } from "./ports/store/add-wanted-item.store";

export function useAddWantedItemViewModel(accountId: string) {
    const item = useAddWantedItemStore((state) => state.item);
    const draft = useAddWantedItemStore((state) => state.draft);
    const submitted = useAddWantedItemStore((state) => state.submitted);
    const changeDraft = useAddWantedItemStore((state) => state.changeDraft);
    const markSubmitted = useAddWantedItemStore((state) => state.markSubmitted);
    const stopAdding = useAddWantedItemStore((state) => state.stopAdding);
    const { mutate, isPending, error, reset } = useAddWantedItemMutation(accountId);
    const maxError = draft ? validateMax(draft) : null;
    const alreadyWanted = isAlreadyWanted(error);

    const close = () => {
        reset();
        stopAdding();
    };

    const submit = () => {
        markSubmitted();
        if (!item || !draft || maxError) return;
        mutate(toNewWantedItem(item.marketHashName, draft), { onSuccess: close });
    };

    return {
        item: item ? toCatalogItemView(item) : null,
        draft,
        maxError: submitted ? maxError : null,
        percentageHint: describePercentage(draft?.percentage ?? ""),
        alreadyWanted,
        failed: error !== null && !alreadyWanted,
        pending: isPending,
        changeDraft,
        submit,
        close,
    };
}

export type AddWantedItemViewModel = ReturnType<typeof useAddWantedItemViewModel>;
