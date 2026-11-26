import { definePort } from "@/shared/lib/define-port";
import type { CatalogItem } from "../../../model/catalog-item";
import type { WantedItemDraft } from "../../../model/wanted-item-draft";

const ADD_WANTED_ITEM_STORE_PORT = "AddWantedItemStore";

export type AddWantedItemState = {
    item: CatalogItem | null;
    draft: WantedItemDraft | null;
    submitted: boolean;
    startAdding: (item: CatalogItem, draft: WantedItemDraft) => void;
    changeDraft: (changes: Partial<WantedItemDraft>) => void;
    markSubmitted: () => void;
    stopAdding: () => void;
};

export type UseAddWantedItemStore = <TValue>(selector: (state: AddWantedItemState) => TValue) => TValue;

const { Provider, usePort } = definePort<UseAddWantedItemStore>(ADD_WANTED_ITEM_STORE_PORT);

export const AddWantedItemStoreProvider = Provider;

export const useAddWantedItemStore: UseAddWantedItemStore = (selector) => usePort()(selector);
