import type { ComponentProps } from "react";
import { formatShortcut } from "@/shared/lib/keyboard/format-shortcut";
import type { ShortcutModifier } from "@/shared/lib/keyboard/shortcut-modifier";
import { Kbd } from "@/shared/ui/components/kbd";

type ShortcutKbdProps = Omit<ComponentProps<typeof Kbd>, "children"> & {
    modifier: ShortcutModifier;
    shortcutKey: string;
};

export function ShortcutKbd({ modifier, shortcutKey, ...props }: ShortcutKbdProps) {
    return <Kbd {...props}>{formatShortcut(modifier, shortcutKey)}</Kbd>;
}
