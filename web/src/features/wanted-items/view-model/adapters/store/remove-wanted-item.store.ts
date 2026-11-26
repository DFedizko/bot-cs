import { create } from "zustand";
import type { RemoveWantedItemState } from "../../ports/store/remove-wanted-item.store";

export const useRemoveWantedItemStore = create<RemoveWantedItemState>()((set) => ({
    item: null,
    startRemoving: (item) => set({ item }),
    stopRemoving: () => set({ item: null }),
}));
