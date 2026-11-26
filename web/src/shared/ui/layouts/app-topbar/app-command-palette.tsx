import type { ReactNode } from "react";
import { useKeyboardShortcut } from "@/shared/hooks/useKeyboardShortcut";
import { useCommandPaletteStore } from "@/shared/lib/store/command-palette.store";
import { CommandDialog } from "@/shared/ui/components/command";

const SHORTCUT_KEY = "k";
const SEARCH_LABEL = "Search any item";
const SEARCH_DESCRIPTION = "Find a CS2 item to add as a wanted item";

type AppCommandPaletteProps = { children: ReactNode };

export function AppCommandPalette({ children }: AppCommandPaletteProps) {
    const open = useCommandPaletteStore((state) => state.open);
    const setOpen = useCommandPaletteStore((state) => state.setOpen);
    const toggleOpen = useCommandPaletteStore((state) => state.toggleOpen);

    useKeyboardShortcut(SHORTCUT_KEY, toggleOpen);

    return (
        <CommandDialog
            open={open}
            onOpenChange={setOpen}
            title={SEARCH_LABEL}
            description={SEARCH_DESCRIPTION}
            className="max-w-xl sm:max-w-xl"
        >
            {children}
        </CommandDialog>
    );
}
