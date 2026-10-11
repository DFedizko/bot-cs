import { MaxAboveRecommendedPercentage } from "@/contexts/trading/bidding/domain/wanted-skin/criteria/max-above-recommended-percentage";
import { bidCandidate } from "../__builders__/bid-candidate.builder";

test("Should return true when use a percentage below than specification", () =>
    expect(
        new MaxAboveRecommendedPercentage("2").isSatisfiedBy(bidCandidate({ aboveRecommendedPercentage: "1.99" })),
    ).toBe(true));
test("Should return false when use a percentage above than specification", () =>
    expect(
        new MaxAboveRecommendedPercentage("2").isSatisfiedBy(bidCandidate({ aboveRecommendedPercentage: "2.01" })),
    ).toBe(false));
test("Should return true when use same percentage value than specification", () =>
    expect(
        new MaxAboveRecommendedPercentage("2").isSatisfiedBy(bidCandidate({ aboveRecommendedPercentage: "2" })),
    ).toBe(true));
test("Should return true when use a percentage below than specification with negative values", () =>
    expect(
        new MaxAboveRecommendedPercentage("-2.99").isSatisfiedBy(bidCandidate({ aboveRecommendedPercentage: "-3" })),
    ).toBe(true));
test("Should return false when use a percentage above than specification with negative values", () =>
    expect(
        new MaxAboveRecommendedPercentage("-3").isSatisfiedBy(bidCandidate({ aboveRecommendedPercentage: "2.99" })),
    ).toBe(false));
