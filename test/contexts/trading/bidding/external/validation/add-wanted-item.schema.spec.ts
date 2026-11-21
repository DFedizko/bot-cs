import { addWantedItemSchema } from "@/contexts/trading/bidding/external/validation/add-wanted-item.schema";

const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const FIELD_TESTED = { type: "IsWear", value: "Field-Tested" };
const asiimov = { accountId: "1", name: ITEM_NAME, maxFor: "-3", criteria: [FIELD_TESTED] };

const failingPaths = (input: unknown): string[] =>
    addWantedItemSchema.safeParse(input).error?.issues.map(({ path }) => path.join(".")) ?? [];

describe("addWantedItemSchema", () => {
    it("Should convert the account id of the path to a number", () => {
        const input = addWantedItemSchema.parse(asiimov);

        expect(input).toEqual({ accountId: 1, name: ITEM_NAME, maxFor: "-3", criteria: [FIELD_TESTED] });
    });

    it("Should convert a numeric max for to text", () => {
        const input = addWantedItemSchema.parse({ ...asiimov, maxFor: -3.5 });

        expect(input.maxFor).toBe("-3.5");
    });

    it("Should accept an item without criteria", () => {
        const input = addWantedItemSchema.parse({ ...asiimov, criteria: undefined });

        expect(input.criteria).toBeUndefined();
    });

    it("Should keep an unknown criterion type for the domain to judge", () => {
        const input = addWantedItemSchema.parse({ ...asiimov, criteria: [{ type: "IsShiny", value: "yes" }] });

        expect(input.criteria).toEqual([{ type: "IsShiny", value: "yes" }]);
    });

    it.each([["john"], ["0"], ["1.5"], [""]])("Should reject the account id %p", (accountId) => {
        const paths = failingPaths({ ...asiimov, accountId });

        expect(paths).toEqual(["accountId"]);
    });

    it("Should reject an input without name and max for", () => {
        const paths = failingPaths({ accountId: "1" });

        expect(paths).toEqual(["name", "maxFor"]);
    });

    it("Should reject a max for that is neither text nor number", () => {
        const paths = failingPaths({ ...asiimov, maxFor: true });

        expect(paths).toEqual(["maxFor"]);
    });

    it("Should reject criteria that are not a list of type and value", () => {
        const paths = failingPaths({ ...asiimov, criteria: [{ type: "IsWear" }] });

        expect(paths).toEqual(["criteria.0.value"]);
    });
});
