import {
    maxForPercentage,
    maxForValue,
} from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { addWantedItemSchema } from "@/contexts/trading/bidding/external/validation/add-wanted-item.schema";

const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const FIELD_TESTED = { type: "IsWear", value: "Field-Tested" };
const MAX_PERCENTAGE = { type: "percentage", value: "-3" };
const MAX_VALUE = { type: "value", value: 19400 };
const asiimov = { accountId: "1", name: ITEM_NAME, maxFor: MAX_PERCENTAGE, criteria: [FIELD_TESTED] };

const failingPaths = (input: unknown): string[] =>
    addWantedItemSchema.safeParse(input).error?.issues.map(({ path }) => path.join(".")) ?? [];

describe("addWantedItemSchema", () => {
    it("Should convert the account id of the path to a number", () => {
        const input = addWantedItemSchema.parse(asiimov);

        expect(input).toEqual({
            accountId: 1,
            name: ITEM_NAME,
            maxFor: maxForPercentage("-3"),
            criteria: [FIELD_TESTED],
        });
    });

    it("Should convert a numeric max percentage to text", () => {
        const input = addWantedItemSchema.parse({ ...asiimov, maxFor: { type: "percentage", value: -3.5 } });

        expect(input.maxFor).toEqual(maxForPercentage("-3.5"));
    });

    it("Should accept a max value in coin cents", () => {
        const input = addWantedItemSchema.parse({ ...asiimov, maxFor: MAX_VALUE });

        expect(input.maxFor).toEqual(maxForValue(19400));
    });

    it.each([[0], [-1]])("Should leave the max value %p for the domain to judge", (value) => {
        const input = addWantedItemSchema.parse({ ...asiimov, maxFor: { type: "value", value } });

        expect(input.maxFor).toEqual(maxForValue(value));
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

    it.each([[true], ["-3"], [-3], [null]])("Should reject the max for %p that is not a typed object", (maxFor) => {
        const paths = failingPaths({ ...asiimov, maxFor });

        expect(paths).toEqual(["maxFor"]);
    });

    it("Should reject a max for of an unknown type", () => {
        const paths = failingPaths({ ...asiimov, maxFor: { type: "discount", value: "-3" } });

        expect(paths).toEqual(["maxFor.type"]);
    });

    it.each([[true], [null]])("Should reject the max percentage %p that is neither text nor number", (value) => {
        const paths = failingPaths({ ...asiimov, maxFor: { type: "percentage", value } });

        expect(paths).toEqual(["maxFor.value"]);
    });

    it.each([[194.5], ["19400"], [null]])("Should reject the max value %p that is not whole coin cents", (value) => {
        const paths = failingPaths({ ...asiimov, maxFor: { type: "value", value } });

        expect(paths).toEqual(["maxFor.value"]);
    });

    it("Should reject criteria that are not a list of type and value", () => {
        const paths = failingPaths({ ...asiimov, criteria: [{ type: "IsWear" }] });

        expect(paths).toEqual(["criteria.0.value"]);
    });
});
