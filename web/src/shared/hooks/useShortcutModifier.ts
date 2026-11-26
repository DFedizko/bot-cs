import type { ShortcutModifier } from "@/shared/lib/keyboard/shortcut-modifier";
import { useShortcutPlatform } from "@/shared/lib/keyboard/shortcut-platform";

export const useShortcutModifier = (): ShortcutModifier => useShortcutPlatform().readModifier();
