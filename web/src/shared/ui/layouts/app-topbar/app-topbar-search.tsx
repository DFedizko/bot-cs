import { Search } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { useCommandPaletteStore } from "@/shared/lib/store/command-palette.store";
import { useShortcutModifier } from "@/shared/hooks/useShortcutModifier";
import { toAriaShortcut } from "@/shared/lib/keyboard/to-aria-shortcut";
import { ShortcutKbd } from "@/shared/ui/components/shortcut-kbd";

const SEARCH_STROKE = 2;
const SEARCH_KEY = "k";

export function AppTopbarSearch({ className, ...props }: ComponentProps<"button">) {
    const setOpen = useCommandPaletteStore((state) => state.setOpen);
    const modifier = useShortcutModifier();
    return (
        <button
            type="button"
            aria-keyshortcuts={toAriaShortcut(modifier, SEARCH_KEY)}
            onClick={() => setOpen(true)}
            className={cn(
                "flex h-9 w-70 items-center gap-2 rounded-md border border-line bg-surface-2 pr-2 pl-3 text-sm text-faint hover:border-line-strong hover:text-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                className,
            )}
            {...props}
        >
            <Search aria-hidden className="size-4" strokeWidth={SEARCH_STROKE} />
            <span className="flex-1 text-left">Search any item…</span>
            <ShortcutKbd aria-hidden modifier={modifier} shortcutKey={SEARCH_KEY} />
        </button>
    );
}
