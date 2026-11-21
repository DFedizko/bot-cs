import { toggleWantedItemSchema } from "@/contexts/trading/bidding/external/validation/toggle-wanted-item.schema";

const ITEM_NAME = "AWP | Asiimov (Field-Tested)";

const failingPaths = (input: unknown): string[] =>
    toggleWantedItemSchema.safeParse(input).error?.issues.map(({ path }) => path.join(".")) ?? [];

describe("toggleWantedItemSchema", () => {
    it("Should convert the account id and keep the item name and the wanted state", () => {
        const input = toggleWantedItemSchema.parse({ accountId: "1", name: ITEM_NAME, enabled: false });

        expect(input).toEqual({ accountId: 1, name: ITEM_NAME, enabled: false });
    });

    it("Should reject a missing enabled state", () => {
        const paths = failingPaths({ accountId: "1", name: ITEM_NAME });

        expect(paths).toEqual(["enabled"]);
    });

    it("Should reject an enabled state that is not a boolean", () => {
        const paths = failingPaths({ accountId: "1", name: ITEM_NAME, enabled: "false" });

        expect(paths).toEqual(["enabled"]);
    });

    it("Should reject an account id that is not a positive whole number", () => {
        const paths = failingPaths({ accountId: "-1", name: ITEM_NAME, enabled: true });

        expect(paths).toEqual(["accountId"]);
    });
});
