import { RankComparator } from "@/packages/infrastructure/in-memory-query/comparators/rank.comparator";
import { BIG_PEAR, MID_BANANA, SMALL_APPLE, sortedBy, type Foo } from "../__stubs__/foo.stub";

const COLOR_ORDER = ["green", "red"];
const NO_COLOR_RANK = -1;
const LAST_RANK = 99;

describe("RankComparator", () => {
    it("Should order items by the rank of their key in the list", () => {
        const byColor = new RankComparator<Foo, string>(({ color }) => color, COLOR_ORDER, NO_COLOR_RANK);

        const sorted = sortedBy([SMALL_APPLE, BIG_PEAR], (first, second) => byColor.compare(first, second));

        expect(sorted).toEqual([BIG_PEAR, SMALL_APPLE]);
    });

    it("Should give an item without a key the fallback rank", () => {
        const byColor = new RankComparator<Foo, string>(({ color }) => color, COLOR_ORDER, NO_COLOR_RANK);

        const sorted = sortedBy([SMALL_APPLE, MID_BANANA, BIG_PEAR], (first, second) => byColor.compare(first, second));

        expect(sorted).toEqual([MID_BANANA, BIG_PEAR, SMALL_APPLE]);
    });

    it("Should put an item without a key last when the fallback rank is the highest", () => {
        const byColor = new RankComparator<Foo, string>(({ color }) => color, COLOR_ORDER, LAST_RANK);

        const sorted = sortedBy([MID_BANANA, SMALL_APPLE], (first, second) => byColor.compare(first, second));

        expect(sorted).toEqual([SMALL_APPLE, MID_BANANA]);
    });
});
