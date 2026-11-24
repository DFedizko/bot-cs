import { listWantedItemsResponseSchema } from "@/contexts/trading/bidding/external/validation/list-wanted-items.response-schema";
import { WANTED_ITEMS_PAGE } from "@/contexts/trading/bidding/infrastructure/docs/list-wanted-items.route-doc";

describe("listWantedItemsResponseSchema", () => {
    it("Should accept the documented example page", () => {
        const parsed = listWantedItemsResponseSchema.safeParse(WANTED_ITEMS_PAGE);

        expect(parsed.success).toBe(true);
    });

    it("Should reject an item whose max for type is unknown", () => {
        const [item] = WANTED_ITEMS_PAGE.items;
        const page = { ...WANTED_ITEMS_PAGE, items: [{ ...item, maxFor: { type: "everything", value: "1" } }] };

        const parsed = listWantedItemsResponseSchema.safeParse(page);

        expect(parsed.success).toBe(false);
    });
});
