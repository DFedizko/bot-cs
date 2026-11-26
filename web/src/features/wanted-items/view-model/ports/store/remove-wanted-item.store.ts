import { definePort } from "@/shared/lib/define-port";
import type { WantedItemView } from "../../../model/wanted-item-view";

const REMOVE_WANTED_ITEM_STORE_PORT = "RemoveWantedItemStore";

export type RemoveWantedItemState = {
    item: WantedItemView | null;
    startRemoving: (item: WantedItemView) => void;
    stopRemoving: () => void;
};

export type UseRemoveWantedItemStore = <TValue>(selector: (state: RemoveWantedItemState) => TValue) => TValue;

const { Provider, usePort } = definePort<UseRemoveWantedItemStore>(REMOVE_WANTED_ITEM_STORE_PORT);

export const RemoveWantedItemStoreProvider = Provider;

export const useRemoveWantedItemStore: UseRemoveWantedItemStore = (selector) => usePort()(selector);
