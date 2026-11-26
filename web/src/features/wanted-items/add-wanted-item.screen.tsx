import { AddWantedItemView } from "./view/add-wanted-item.view";
import { useAddWantedItemViewModel } from "./view-model/useAddWantedItemViewModel";

type AddWantedItemScreenProps = { accountId: string };

export function AddWantedItemScreen({ accountId }: AddWantedItemScreenProps) {
    return <AddWantedItemView {...useAddWantedItemViewModel(accountId)} />;
}
