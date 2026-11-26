import { create } from "zustand";
import type { CommandPaletteState } from "@/shared/lib/store/command-palette.store";

export const useCommandPaletteStore = create<CommandPaletteState>()((set) => ({
    open: false,
    setOpen: (open) => set({ open }),
    toggleOpen: () => set(({ open }) => ({ open: !open })),
}));
