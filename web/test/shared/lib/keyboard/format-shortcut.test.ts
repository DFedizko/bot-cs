import { describe, expect, it } from "bun:test";
import { formatShortcut } from "@/shared/lib/keyboard/format-shortcut";

describe("formatShortcut", () => {
    it("Should write a Mac shortcut with the command sign", () => {
        expect(formatShortcut("meta", "k")).toBe("⌘K");
    });

    it("Should write a Windows or Linux shortcut with Ctrl", () => {
        expect(formatShortcut("ctrl", "b")).toBe("Ctrl B");
    });
});
