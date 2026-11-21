import { editWantedItemSchema } from "@/contexts/trading/bidding/external/validation/edit-wanted-item.schema";

const ITEM_NAME = "AWP | Asiimov (Field-Tested)";
const FIELD_TESTED = { type: "IsWear", value: "Field-Tested" };

const failingPaths = (input: unknown): string[] =>
    editWantedItemSchema.safeParse(input).error?.issues.map(({ path }) => path.join(".")) ?? [];

describe("editWantedItemSchema", () => {
    it("Should convert the account id and keep the item name of the path", () => {
        const input = editWantedItemSchema.parse({ accountId: "1", name: ITEM_NAME, maxFor: 5 });

        expect(input).toEqual({ accountId: 1, name: ITEM_NAME, maxFor: "5" });
    });

    it("Should accept new criteria alone", () => {
        const input = editWantedItemSchema.parse({ accountId: "1", name: ITEM_NAME, criteria: [FIELD_TESTED] });

        expect(input).toEqual({ accountId: 1, name: ITEM_NAME, criteria: [FIELD_TESTED] });
    });

    it("Should leave an empty edit for the domain to reject", () => {
        const input = editWantedItemSchema.parse({ accountId: "1", name: ITEM_NAME });

        expect(input).toEqual({ accountId: 1, name: ITEM_NAME });
    });

    it("Should reject a max for that is neither text nor number", () => {
        const paths = failingPaths({ accountId: "1", name: ITEM_NAME, maxFor: true });

        expect(paths).toEqual(["maxFor"]);
    });

    it("Should reject an account id that is not a positive whole number", () => {
        const paths = failingPaths({ accountId: "-1", name: ITEM_NAME, maxFor: "5" });

        expect(paths).toEqual(["accountId"]);
    });
});
