import { searchCatalogItemsResponseSchema } from "@/contexts/catalog/external/validation/search-catalog-items.response-schema";
import { CATALOG_ITEMS_FOUND } from "@/contexts/catalog/infrastructure/docs/search-catalog-items.route-doc";

describe("searchCatalogItemsResponseSchema", () => {
    it("Should accept the documented example", () => {
        const result = searchCatalogItemsResponseSchema.safeParse(CATALOG_ITEMS_FOUND);

        expect(result.success).toBe(true);
    });

    it("Should reject an item with a rarity outside our vocabulary", () => {
        const [item] = CATALOG_ITEMS_FOUND.items;

        const result = searchCatalogItemsResponseSchema.safeParse({ items: [{ ...item, rarity: "Covert" }] });

        expect(result.success).toBe(false);
    });
});
