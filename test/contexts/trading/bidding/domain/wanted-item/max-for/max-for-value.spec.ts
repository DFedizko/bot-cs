import { MaxForValue } from "@/contexts/trading/bidding/domain/wanted-item/max-for/max-for-value";
import { MaxForType, type MaxFor } from "@/contexts/trading/bidding/domain/wanted-item/max-for/max-for";
import { NonPositiveMaxValueError } from "@/contexts/trading/bidding/domain/wanted-item/errors/non-positive-max-value.error";
import { DomainError } from "@/packages/error/domain-error";
import { bidCandidate } from "../__builders__/bid-candidate.builder";

const MAX_VALUE = 19400;

describe("MaxForValue", () => {
    it.each([[1000], [20000], [50000]])(
        "Should allow at most its value whatever the reference price %p",
        (referencePrice) => {
            const maxFor: MaxFor = new MaxForValue(MAX_VALUE);

            const price = maxFor.maxPriceFor(bidCandidate({ referencePrice }));

            expect(price.getAmount()).toBe(MAX_VALUE);
        },
    );

    it.each([[MAX_VALUE], [MAX_VALUE - 1], [1]])("Should accept a candidate worth %p", (value) => {
        const maxFor = new MaxForValue(MAX_VALUE);

        const accepted = maxFor.isSatisfiedBy(bidCandidate({ value }));

        expect(accepted).toBe(true);
    });

    it.each([[MAX_VALUE + 1], [50000]])("Should refuse a candidate worth %p", (value) => {
        const maxFor = new MaxForValue(MAX_VALUE);

        const accepted = maxFor.isSatisfiedBy(bidCandidate({ value }));

        expect(accepted).toBe(false);
    });

    it("Should describe why it refuses a candidate", () => {
        const maxFor = new MaxForValue(MAX_VALUE);

        expect(maxFor.describe()).toBe("AboveMaxValue(19400)");
    });

    it("Should give back its primitives", () => {
        const maxFor = new MaxForValue(MAX_VALUE);

        expect(maxFor.toPrimitives()).toEqual({ type: MaxForType.VALUE, value: MAX_VALUE });
    });

    it.each([[0], [-1], [-19400]])("Should reject the value %p that is not above zero", (value) => {
        const create = () => new MaxForValue(value);

        expect(create).toThrow(NonPositiveMaxValueError);
    });

    it("Should reject a value that is not whole coin cents", () => {
        const create = () => new MaxForValue(194.5);

        expect(create).toThrow(DomainError);
    });
});
