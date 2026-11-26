import { useEffect } from "react";
import { useCommandPaletteStore } from "@/shared/lib/store/command-palette.store";
import { Command, CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/shared/ui/components/command";

const SHORTCUT_KEY = "k";
const SEARCH_LABEL = "Search any item";

export function AppCommandPalette() {
    const open = useCommandPaletteStore((state) => state.open);
    const setOpen = useCommandPaletteStore((state) => state.setOpen);
    const toggleOpen = useCommandPaletteStore((state) => state.toggleOpen);

    useEffect(() => {
        const toggleOnShortcut = (event: KeyboardEvent) => {
            if (event.key !== SHORTCUT_KEY || !(event.metaKey || event.ctrlKey)) return;
            event.preventDefault();
            toggleOpen();
        };
        window.addEventListener("keydown", toggleOnShortcut);
        return () => window.removeEventListener("keydown", toggleOnShortcut);
    }, [toggleOpen]);

    return (
        <CommandDialog
            open={open}
            onOpenChange={setOpen}
            title={SEARCH_LABEL}
            description="Find a CS2 item to add as a wanted item"
        >
            <Command label={SEARCH_LABEL}>
                <CommandInput placeholder={`${SEARCH_LABEL}…`} />
                <CommandList>
                    <CommandEmpty>Type a skin, knife or gloves to search the catalog.</CommandEmpty>
                </CommandList>
            </Command>
        </CommandDialog>
    );
}
