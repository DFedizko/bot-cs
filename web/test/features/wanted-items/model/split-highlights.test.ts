import { describe, expect, it } from "bun:test";
import { splitHighlights } from "@/features/wanted-items/model/split-highlights";

describe("splitHighlights", () => {
    it("Should mark each searched word in the name, ignoring case", () => {
        expect(splitHighlights("StatTrak™ AWP | Asiimov", "stat asii")).toEqual([
            { text: "Stat", match: true },
            { text: "Trak™ AWP | ", match: false },
            { text: "Asii", match: true },
            { text: "mov", match: false },
        ]);
    });

    it("Should keep the whole name unmarked when nothing matches", () => {
        expect(splitHighlights("AWP", "karambit")).toEqual([{ text: "AWP", match: false }]);
    });

    it("Should treat the searched text literally", () => {
        expect(splitHighlights("AWP | Asiimov", "|")).toEqual([
            { text: "AWP ", match: false },
            { text: "|", match: true },
            { text: " Asiimov", match: false },
        ]);
    });
});
