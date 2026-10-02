import { Price } from "@/contexts/trading/bidding/domain/value-objects/price";

describe("Price", () => {
    it("Should create a price object", () => {
        const price = Price.create({
            marketPriceInCents: 100,
            suggestedPriceInCents: 110,
            aboveRecommendedFractionPercentage: "0",
        });
        expect(price.getMarketPrice()).toBe(100n);
        expect(price.getSuggestedPrice()).toBe(110n);
        expect(price.getAboveRecommendedPercentage()).toBe("0");
        expect(price.getCurrency()).toBe("COIN");
    });
});
