import {
    maxForPercentage,
    maxForValue,
} from "@/contexts/trading/bidding/domain/wanted-item/__builders__/max-for.builder";
import { editWantedItemSchema } from "@/contexts/trading/bidding/external/validation/edit-wanted-item.schema";

const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const FIELD_TESTED = { type: "IsWear", value: "Field-Tested" };
const MAX_PERCENTAGE = { type: "percentage", value: 5 };
const MAX_VALUE = { type: "value", value: 19400 };

const failingPaths = (input: unknown): string[] =>
    editWantedItemSchema.safeParse(input).error?.issues.map(({ path }) => path.join(".")) ?? [];

describe("editWantedItemSchema", () => {
    it("Should convert the account id and keep the item name of the path", () => {
        const input = editWantedItemSchema.parse({ accountId: "1", name: ITEM_NAME, maxFor: MAX_PERCENTAGE });

        expect(input).toEqual({ accountId: 1, name: ITEM_NAME, maxFor: maxForPercentage("5") });
    });

    it("Should accept a new max value", () => {
        const input = editWantedItemSchema.parse({ accountId: "1", name: ITEM_NAME, maxFor: MAX_VALUE });

        expect(input).toEqual({ accountId: 1, name: ITEM_NAME, maxFor: maxForValue(19400) });
    });

    it("Should accept new criteria alone", () => {
        const input = editWantedItemSchema.parse({ accountId: "1", name: ITEM_NAME, criteria: [FIELD_TESTED] });

        expect(input).toEqual({ accountId: 1, name: ITEM_NAME, criteria: [FIELD_TESTED] });
    });

    it("Should leave an empty edit for the domain to reject", () => {
        const input = editWantedItemSchema.parse({ accountId: "1", name: ITEM_NAME });

        expect(input).toEqual({ accountId: 1, name: ITEM_NAME });
    });

    it.each([[true], ["5"]])("Should reject the max for %p that is not a typed object", (maxFor) => {
        const paths = failingPaths({ accountId: "1", name: ITEM_NAME, maxFor });

        expect(paths).toEqual(["maxFor"]);
    });

    it("Should reject a max value that is not whole coin cents", () => {
        const paths = failingPaths({ accountId: "1", name: ITEM_NAME, maxFor: { type: "value", value: 1.5 } });

        expect(paths).toEqual(["maxFor.value"]);
    });

    it("Should reject an account id that is not a positive whole number", () => {
        const paths = failingPaths({ accountId: "-1", name: ITEM_NAME, maxFor: MAX_PERCENTAGE });

        expect(paths).toEqual(["accountId"]);
    });
});
