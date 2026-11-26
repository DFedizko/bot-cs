import type { ShortcutModifier } from "@/shared/lib/keyboard/shortcut-modifier";

export type NavigatorPlatform = { userAgentData?: { platform: string }; platform: string };

const APPLE_PLATFORMS = /mac|iphone|ipad|ipod/i;

export function readShortcutModifier(browser: NavigatorPlatform = navigator): ShortcutModifier {
    const platform = browser.userAgentData?.platform || browser.platform;
    return APPLE_PLATFORMS.test(platform) ? "meta" : "ctrl";
}
