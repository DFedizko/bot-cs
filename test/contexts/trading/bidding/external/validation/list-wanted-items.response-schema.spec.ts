import { listWantedItemsResponseSchema } from "@/contexts/trading/bidding/external/validation/list-wanted-items.response-schema";
import {
    WANTED_ITEMS_PAGE,
    ASIIMOV_WANTED,
} from "@/contexts/trading/bidding/infrastructure/docs/wanted-items-page.example";

const withItem = (item: object) => ({ ...WANTED_ITEMS_PAGE, items: [{ ...ASIIMOV_WANTED, ...item }] });

describe("listWantedItemsResponseSchema", () => {
    it("Should accept the documented example page", () => {
        const parsed = listWantedItemsResponseSchema.safeParse(WANTED_ITEMS_PAGE);

        expect(parsed.success).toBe(true);
    });

    it("Should document items with catalog details and an item the catalog doesn't know", () => {
        const catalogs = WANTED_ITEMS_PAGE.items.map(({ catalog }) => catalog?.rarity ?? null);

        expect(catalogs).toEqual(["covert", "classified", "extraordinary", null]);
    });

    it("Should accept an item without catalog details", () => {
        const parsed = listWantedItemsResponseSchema.safeParse(withItem({ catalog: null }));

        expect(parsed.success).toBe(true);
    });

    it("Should accept catalog details without a wear", () => {
        const parsed = listWantedItemsResponseSchema.safeParse(
            withItem({ catalog: { ...ASIIMOV_WANTED.catalog, wear: null } }),
        );

        expect(parsed.success).toBe(true);
    });

    it("Should reject a rarity the catalog doesn't have", () => {
        const parsed = listWantedItemsResponseSchema.safeParse(
            withItem({ catalog: { ...ASIIMOV_WANTED.catalog, rarity: "legendary" } }),
        );

        expect(parsed.success).toBe(false);
    });

    it("Should reject an added-at time that is not ISO 8601", () => {
        const parsed = listWantedItemsResponseSchema.safeParse(withItem({ addedAt: "yesterday" }));

        expect(parsed.success).toBe(false);
    });

    it("Should reject a page without its counts", () => {
        const { items, page, pageSize, total } = WANTED_ITEMS_PAGE;

        const parsed = listWantedItemsResponseSchema.safeParse({ items, page, pageSize, total });

        expect(parsed.success).toBe(false);
    });

    it("Should reject an item whose max for type is unknown", () => {
        const parsed = listWantedItemsResponseSchema.safeParse(
            withItem({ maxFor: { type: "everything", value: "1" } }),
        );

        expect(parsed.success).toBe(false);
    });
});
