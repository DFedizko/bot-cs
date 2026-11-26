import { definePort } from "../define-port";
import type { ShortcutModifier } from "./shortcut-modifier";

const SHORTCUT_PLATFORM_PORT = "ShortcutPlatform";

export interface ShortcutPlatform {
    readModifier: () => ShortcutModifier;
}

export const { Provider: ShortcutPlatformProvider, usePort: useShortcutPlatform } =
    definePort<ShortcutPlatform>(SHORTCUT_PLATFORM_PORT);
