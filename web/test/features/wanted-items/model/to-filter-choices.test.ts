import { describe, expect, it } from "bun:test";
import { toFilterChoices } from "@/features/wanted-items/model/to-filter-choices";

describe("toFilterChoices", () => {
    it("Should count each filter's items", () => {
        expect(toFilterChoices({ all: 47, enabled: 41, disabled: 6 })).toEqual([
            { value: "all", count: 47 },
            { value: "active", count: 41 },
            { value: "paused", count: 6 },
        ]);
    });

    it("Should leave the counts out until they are known", () => {
        expect(toFilterChoices(undefined).map(({ count }) => count)).toEqual([null, null, null]);
    });
});
