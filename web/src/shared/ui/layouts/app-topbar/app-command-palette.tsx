import { useKeyboardShortcut } from "@/shared/hooks/useKeyboardShortcut";
import { useCommandPaletteStore } from "@/shared/lib/store/command-palette.store";
import { Command, CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/shared/ui/components/command";

const SHORTCUT_KEY = "k";
const SEARCH_LABEL = "Search any item";
const SEARCH_DESCRIPTION = "Find a CS2 item to add as a wanted item";

export function AppCommandPalette() {
    const open = useCommandPaletteStore((state) => state.open);
    const setOpen = useCommandPaletteStore((state) => state.setOpen);
    const toggleOpen = useCommandPaletteStore((state) => state.toggleOpen);

    useKeyboardShortcut(SHORTCUT_KEY, toggleOpen);

    return (
        <CommandDialog open={open} onOpenChange={setOpen} title={SEARCH_LABEL} description={SEARCH_DESCRIPTION}>
            <Command label={SEARCH_LABEL}>
                <CommandInput placeholder={`${SEARCH_LABEL}…`} />
                <CommandList>
                    <CommandEmpty>Type a skin, knife or gloves to search the catalog.</CommandEmpty>
                </CommandList>
            </Command>
        </CommandDialog>
    );
}
