import { searchCatalogItemsSchema } from "@/contexts/catalog/external/validation/search-catalog-items.schema";

const MAX_LIMIT = 50;

describe("searchCatalogItemsSchema", () => {
    it("Should read the text and the limit", () => {
        const input = searchCatalogItemsSchema.parse({ q: "awp asii", limit: "5" });

        expect(input).toEqual({ q: "awp asii", limit: 5 });
    });

    it("Should trim the text", () => {
        const input = searchCatalogItemsSchema.parse({ q: "  awp  " });

        expect(input).toEqual({ q: "awp" });
    });

    it("Should accept a text of two characters", () => {
        const result = searchCatalogItemsSchema.safeParse({ q: "ak" });

        expect(result.success).toBe(true);
    });

    it("Should accept the max limit", () => {
        const result = searchCatalogItemsSchema.safeParse({ q: "ak", limit: String(MAX_LIMIT) });

        expect(result.success).toBe(true);
    });

    it.each([
        ["no text", {}],
        ["a text shorter than two characters after trimming", { q: " a " }],
        ["a limit of zero", { q: "ak", limit: "0" }],
        ["a limit above the max", { q: "ak", limit: String(MAX_LIMIT + 1) }],
        ["a negative limit", { q: "ak", limit: "-1" }],
    ])("Should reject %s", (_case, query) => {
        const result = searchCatalogItemsSchema.safeParse(query);

        expect(result.success).toBe(false);
    });
});
