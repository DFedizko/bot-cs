import { describe, expect, it } from "bun:test";
import { describeResultCount } from "@/features/wanted-items/model/describe-result-count";

describe("describeResultCount", () => {
    it.each([
        [0, "0 results"],
        [1, "1 result"],
        [5, "5 results"],
    ])("Should count %i as %s", (count, text) => {
        expect(describeResultCount(count)).toBe(text);
    });
});
