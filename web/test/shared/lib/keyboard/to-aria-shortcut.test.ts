import { describe, expect, it } from "bun:test";
import { toAriaShortcut } from "@/shared/lib/keyboard/to-aria-shortcut";

describe("toAriaShortcut", () => {
    it("Should name the Mac shortcut for assistive technology", () => {
        expect(toAriaShortcut("meta", "k")).toBe("Meta+K");
    });

    it("Should name the Windows or Linux shortcut for assistive technology", () => {
        expect(toAriaShortcut("ctrl", "k")).toBe("Control+K");
    });
});
