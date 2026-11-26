import type { ShortcutModifier } from "./shortcut-modifier";

const MODIFIER_LABELS: Readonly<Record<ShortcutModifier, string>> = { meta: "⌘", ctrl: "Ctrl " };

export const formatShortcut = (modifier: ShortcutModifier, key: string) =>
    `${MODIFIER_LABELS[modifier]}${key.toUpperCase()}`;
