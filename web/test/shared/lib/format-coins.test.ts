import { describe, expect, it } from "bun:test";
import { formatCoins } from "@/shared/lib/format-coins";

describe("formatCoins", () => {
    it("Should show coin cents as coins with two decimals and grouped thousands", () => {
        expect(formatCoins(1248036)).toBe("12,480.36");
    });

    it("Should keep the cents of a round amount", () => {
        expect(formatCoins(86500)).toBe("865.00");
    });
});
