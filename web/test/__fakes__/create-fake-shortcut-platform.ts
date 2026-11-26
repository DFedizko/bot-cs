import type { ShortcutModifier } from "@/shared/lib/keyboard/shortcut-modifier";
import type { ShortcutPlatform } from "@/shared/lib/keyboard/shortcut-platform";

export const DEFAULT_TEST_MODIFIER: ShortcutModifier = "ctrl";

export const createFakeShortcutPlatform = (modifier: ShortcutModifier = DEFAULT_TEST_MODIFIER): ShortcutPlatform => ({
    readModifier: () => modifier,
});
