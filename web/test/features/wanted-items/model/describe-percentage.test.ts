import { describe, expect, it } from "bun:test";
import { describePercentage } from "@/features/wanted-items/model/describe-percentage";

describe("describePercentage", () => {
    it("Should explain a max below the recommended price", () => {
        expect(describePercentage("-3")).toBe("Bot bids up to 3% below the recommended price. Negative = below.");
    });

    it("Should explain a max above the recommended price", () => {
        expect(describePercentage("+2.5")).toBe("Bot bids up to 2.5% above the recommended price. Negative = below.");
    });

    it("Should explain a max at the recommended price", () => {
        expect(describePercentage("0")).toBe("Bot bids up to the recommended price. Negative = below.");
    });

    it("Should explain the field when the percentage isn't a number yet", () => {
        expect(describePercentage("abc")).toBe("Percentage over the recommended price. Negative = below.");
    });
});
