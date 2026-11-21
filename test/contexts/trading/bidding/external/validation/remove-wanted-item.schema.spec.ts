import { removeWantedItemSchema } from "@/contexts/trading/bidding/external/validation/remove-wanted-item.schema";

const ITEM_NAME = "AWP | Asiimov (Field-Tested)";

describe("removeWantedItemSchema", () => {
    it("Should convert the account id and keep the item name of the path", () => {
        const input = removeWantedItemSchema.parse({ accountId: "1", name: ITEM_NAME });

        expect(input).toEqual({ accountId: 1, name: ITEM_NAME });
    });

    it("Should reject an account id that is not a number", () => {
        const result = removeWantedItemSchema.safeParse({ accountId: "john", name: ITEM_NAME });

        expect(result.error?.issues.map(({ path }) => path.join("."))).toEqual(["accountId"]);
    });
});
