import { KeyComparator } from "@/packages/infrastructure/in-memory-query/comparators/key.comparator";
import { ReversedComparator } from "@/packages/infrastructure/in-memory-query/comparators/reversed.comparator";
import { BIG_PEAR, MID_BANANA, SMALL_APPLE, sortedBy, type Foo } from "../__stubs__/foo.stub";

describe("ReversedComparator", () => {
    it("Should invert the order of the comparator it wraps", () => {
        const biggestFirst = new ReversedComparator(new KeyComparator<Foo>(({ size }) => size));

        const sorted = sortedBy([SMALL_APPLE, BIG_PEAR, MID_BANANA], (first, second) =>
            biggestFirst.compare(first, second),
        );

        expect(sorted).toEqual([BIG_PEAR, MID_BANANA, SMALL_APPLE]);
    });
});
