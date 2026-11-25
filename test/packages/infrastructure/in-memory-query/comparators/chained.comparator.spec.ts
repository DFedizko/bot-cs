import { KeyComparator } from "@/packages/infrastructure/in-memory-query/comparators/key.comparator";
import { ChainedComparator } from "@/packages/infrastructure/in-memory-query/comparators/chained.comparator";
import { BIG_KIWI, BIG_PEAR, MID_BANANA, SMALL_APPLE, sortedBy, type Foo } from "../__stubs__/foo.stub";

const bySize = new KeyComparator<Foo>(({ size }) => size);
const byName = new KeyComparator<Foo>(({ name }) => name);

describe("ChainedComparator", () => {
    it("Should order by the primary comparator first", () => {
        const chained = new ChainedComparator(bySize, byName);

        const sorted = sortedBy([BIG_PEAR, SMALL_APPLE, MID_BANANA], (first, second) => chained.compare(first, second));

        expect(sorted).toEqual([SMALL_APPLE, MID_BANANA, BIG_PEAR]);
    });

    it("Should break ties with the next comparators in turn", () => {
        const chained = new ChainedComparator(bySize, byName);

        const sorted = sortedBy([BIG_PEAR, BIG_KIWI, SMALL_APPLE], (first, second) => chained.compare(first, second));

        expect(sorted).toEqual([SMALL_APPLE, BIG_KIWI, BIG_PEAR]);
    });

    it("Should find items equal when every comparator does", () => {
        const chained = new ChainedComparator(bySize);

        const comparison = chained.compare(BIG_PEAR, BIG_KIWI);

        expect(comparison).toBe(0);
    });
});
