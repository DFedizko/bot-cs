import { KeyComparator } from "@/packages/infrastructure/in-memory-query/comparators/key.comparator";
import { BIG_PEAR, MID_BANANA, SMALL_APPLE, sortedBy, type Foo } from "../__stubs__/foo.stub";

describe("KeyComparator", () => {
    it("Should order numbers from the lowest to the highest", () => {
        const bySize = new KeyComparator<Foo>(({ size }) => size);

        const sorted = sortedBy([BIG_PEAR, SMALL_APPLE, MID_BANANA], (first, second) => bySize.compare(first, second));

        expect(sorted).toEqual([SMALL_APPLE, MID_BANANA, BIG_PEAR]);
    });

    it("Should order text alphabetically", () => {
        const byName = new KeyComparator<Foo>(({ name }) => name);

        const sorted = sortedBy([BIG_PEAR, SMALL_APPLE, MID_BANANA], (first, second) => byName.compare(first, second));

        expect(sorted).toEqual([SMALL_APPLE, MID_BANANA, BIG_PEAR]);
    });

    it("Should find two items with the same key equal", () => {
        const bySize = new KeyComparator<Foo>(({ size }) => size);

        const comparison = bySize.compare(BIG_PEAR, { ...BIG_PEAR, name: "plum" });

        expect(comparison).toBe(0);
    });
});
