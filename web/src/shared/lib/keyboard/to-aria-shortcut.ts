import type { ShortcutModifier } from "./shortcut-modifier";

const ARIA_MODIFIERS: Readonly<Record<ShortcutModifier, string>> = { meta: "Meta", ctrl: "Control" };

export const toAriaShortcut = (modifier: ShortcutModifier, key: string) =>
    `${ARIA_MODIFIERS[modifier]}+${key.toUpperCase()}`;
