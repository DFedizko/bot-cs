import { SearchCatalogItemsQuery } from "@/contexts/catalog/application/search-catalog-items/search-catalog-items.query";

const TEXT = "awp asii";
const LIMIT = 5;
const QUERY_NAME = "search_catalog_items";

describe("SearchCatalogItemsQuery", () => {
    it("Should be named after the search catalog items use case", () => {
        const query = new SearchCatalogItemsQuery({ text: TEXT });

        expect(query.name).toBe(QUERY_NAME);
    });

    it("Should carry what the driver asked", () => {
        const query = new SearchCatalogItemsQuery({ text: TEXT, limit: LIMIT });

        expect({ ...query }).toEqual({ name: QUERY_NAME, text: TEXT, limit: LIMIT });
    });
});
