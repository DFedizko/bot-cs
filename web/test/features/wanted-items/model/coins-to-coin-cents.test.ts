import { describe, expect, it } from "bun:test";
import { coinsToCoinCents } from "@/features/wanted-items/model/coins-to-coin-cents";

describe("coinsToCoinCents", () => {
    it("Should turn whole coins into coin cents", () => {
        expect(coinsToCoinCents(10)).toBe(1000);
    });
});
