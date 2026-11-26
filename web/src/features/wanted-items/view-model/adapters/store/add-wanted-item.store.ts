import { create } from "zustand";
import type { AddWantedItemState } from "../../ports/store/add-wanted-item.store";

export const useAddWantedItemStore = create<AddWantedItemState>()((set) => ({
    item: null,
    draft: null,
    submitted: false,
    startAdding: (item, draft) => set({ item, draft, submitted: false }),
    changeDraft: (changes) => set(({ draft }) => ({ draft: draft && { ...draft, ...changes } })),
    markSubmitted: () => set({ submitted: true }),
    stopAdding: () => set({ item: null, draft: null, submitted: false }),
}));
