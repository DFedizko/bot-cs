import { describe, expect, it } from "bun:test";
import { cn } from "@/shared/lib/cn";

describe("cn", () => {
    it("Should join classes and drop falsy ones", () => {
        const classes = cn("flex", undefined, { hidden: false, "gap-2": true });

        expect(classes).toBe("flex gap-2");
    });

    it("Should keep the last of two conflicting utilities", () => {
        const classes = cn("bg-surface p-2", "bg-surface-2 p-4");

        expect(classes).toBe("bg-surface-2 p-4");
    });

    it("Should keep a text style beside a text colour", () => {
        const classes = cn("text-page-title", "text-ink");

        expect(classes).toBe("text-page-title text-ink");
    });

    it("Should let a later text style replace an earlier one", () => {
        const classes = cn("text-body", "text-heading");

        expect(classes).toBe("text-heading");
    });

    it("Should let a text style replace a font size", () => {
        const classes = cn("text-sm", "text-figure");

        expect(classes).toBe("text-figure");
    });
});
