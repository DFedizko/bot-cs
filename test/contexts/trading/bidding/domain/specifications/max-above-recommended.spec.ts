import { MaxAboveRecommendedPercentage } from "@/contexts/trading/bidding/domain/specifications/max-above-recommended-percentage";

test("Should return true when use a percentage below than specification", () =>
    expect(new MaxAboveRecommendedPercentage("2").isSatisfiedBy("1.99")).toBe(true));
test("Should return false when use a percentage above than specification", () =>
    expect(new MaxAboveRecommendedPercentage("2").isSatisfiedBy("2.01")).toBe(false));
test("Should return true when use same percentage value than specification", () =>
    expect(new MaxAboveRecommendedPercentage("2").isSatisfiedBy("2")).toBe(true));
test("Should return true when use a percentage below than specification with negative values", () =>
    expect(new MaxAboveRecommendedPercentage("-2.99").isSatisfiedBy("-3")).toBe(true));
test("Should return false when use a percentage above than specification with negative values", () =>
    expect(new MaxAboveRecommendedPercentage("-3").isSatisfiedBy("-2.99")).toBe(false));
