import { Rarity } from "@/contexts/shared-kernel/domain/rarity";
import { searchCatalogItemsResponseSchema } from "@/contexts/catalog/external/validation/search-catalog-items.response-schema";
import { CATALOG_ITEMS_FOUND } from "@/contexts/catalog/infrastructure/docs/search-catalog-items.route-doc";

const [ITEM] = CATALOG_ITEMS_FOUND.items;

describe("searchCatalogItemsResponseSchema", () => {
    it("Should accept the documented example", () => {
        const result = searchCatalogItemsResponseSchema.safeParse(CATALOG_ITEMS_FOUND);

        expect(result.success).toBe(true);
    });

    it.each(Object.values(Rarity))("Should accept the official rarity %s", (rarity) => {
        const result = searchCatalogItemsResponseSchema.safeParse({ items: [{ ...ITEM, rarity }] });

        expect(result.success).toBe(true);
    });

    it("Should reject a rarity outside the official CS2 names", () => {
        const result = searchCatalogItemsResponseSchema.safeParse({ items: [{ ...ITEM, rarity: "covert" }] });

        expect(result.success).toBe(false);
    });
});
