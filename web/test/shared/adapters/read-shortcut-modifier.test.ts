import { describe, expect, it } from "bun:test";
import { readShortcutModifier } from "@/shared/adapters/read-shortcut-modifier";

describe("readShortcutModifier", () => {
    it("Should use ⌘ when the browser reports macOS", () => {
        expect(readShortcutModifier({ userAgentData: { platform: "macOS" }, platform: "" })).toBe("meta");
    });

    it("Should use Ctrl when the browser reports Windows", () => {
        expect(readShortcutModifier({ userAgentData: { platform: "Windows" }, platform: "MacIntel" })).toBe("ctrl");
    });

    it("Should fall back to the older platform string on a Mac", () => {
        expect(readShortcutModifier({ platform: "MacIntel" })).toBe("meta");
    });

    it("Should use Ctrl on Linux", () => {
        expect(readShortcutModifier({ platform: "Linux x86_64" })).toBe("ctrl");
    });

    it("Should use ⌘ on an iPad", () => {
        expect(readShortcutModifier({ platform: "iPad" })).toBe("meta");
    });
});
