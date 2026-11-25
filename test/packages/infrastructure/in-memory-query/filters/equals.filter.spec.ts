import { EqualsFilter } from "@/packages/infrastructure/in-memory-query/filters/equals.filter";
import { BIG_PEAR, MID_BANANA, SMALL_APPLE, type Foo } from "../__stubs__/foo.stub";

const FOOS = [SMALL_APPLE, BIG_PEAR, MID_BANANA];

describe("EqualsFilter", () => {
    it("Should match the items whose key equals the asked value", () => {
        const green = new EqualsFilter<Foo, string | undefined>(({ color }) => color, "green");

        const matching = FOOS.filter((foo) => green.matches(foo));

        expect(matching).toEqual([BIG_PEAR]);
    });

    it("Should match every item when no value is asked", () => {
        const anyColor = new EqualsFilter<Foo, string | undefined>(({ color }) => color, undefined);

        const matching = FOOS.filter((foo) => anyColor.matches(foo));

        expect(matching).toEqual(FOOS);
    });

    it("Should match the items whose key is false when false is asked", () => {
        const notBig = new EqualsFilter<Foo, boolean>(({ size }) => size > MID_BANANA.size, false);

        const matching = FOOS.filter((foo) => notBig.matches(foo));

        expect(matching).toEqual([SMALL_APPLE, MID_BANANA]);
    });
});
