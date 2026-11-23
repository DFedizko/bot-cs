import { MaxForPercentage } from "@/contexts/trading/bidding/domain/wanted-item/max-for/max-for-percentage";
import { MaxForType } from "@/contexts/trading/bidding/domain/wanted-item/max-for/max-for";
import { DomainError } from "@/packages/error/domain-error";
import { bidCandidate } from "../__builders__/bid-candidate.builder";

const REFERENCE_PRICE = 20000;

describe("MaxForPercentage", () => {
    it.each([
        ["-3", 19400],
        ["3", 20600],
        ["0", 20000],
    ])("Should allow at most the reference price plus %p%", (percent, maxPrice) => {
        const maxFor = new MaxForPercentage(percent);

        const price = maxFor.maxPriceFor(bidCandidate({ referencePrice: REFERENCE_PRICE }));

        expect(price.getAmount()).toBe(maxPrice);
    });

    it.each([["-3"], ["-3.01"], ["-10"]])("Should accept a candidate %p% above the recommended price", (above) => {
        const maxFor = new MaxForPercentage("-3");

        const accepted = maxFor.isSatisfiedBy(bidCandidate({ aboveRecommendedPercentage: above }));

        expect(accepted).toBe(true);
    });

    it.each([["-2.99"], ["0"], ["5"]])("Should refuse a candidate %p% above the recommended price", (above) => {
        const maxFor = new MaxForPercentage("-3");

        const accepted = maxFor.isSatisfiedBy(bidCandidate({ aboveRecommendedPercentage: above }));

        expect(accepted).toBe(false);
    });

    it("Should describe why it refuses a candidate", () => {
        const maxFor = new MaxForPercentage("-3");

        expect(maxFor.describe()).toBe("AboveRecommendedPercentage(-3%)");
    });

    it("Should give back its primitives", () => {
        const maxFor = new MaxForPercentage("-3.5");

        expect(maxFor.toPrimitives()).toEqual({ type: MaxForType.PERCENTAGE, value: "-3.5" });
    });

    it("Should reject a value that is not a percentage", () => {
        const create = () => new MaxForPercentage("a lot");

        expect(create).toThrow(DomainError);
    });
});
