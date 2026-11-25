import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { QUERY_BUS } from "@/packages/external/di/packages.identifiers";
import { SearchCatalogItemsQuery } from "@/contexts/catalog/application/search-catalog-items/search-catalog-items.query";
import { CATALOG_ITEMS_DAO, SEARCH_CATALOG_ITEMS_HANDLER } from "@/contexts/catalog/external/di/catalog.identifiers";
import { catalogRow } from "../__builders__/catalog-row.builder";

const TEXT = "awp asii";
const LIMIT = 5;
const ASIIMOV_FOUND = { items: [catalogRow()] };

let container: Container;

describe("SearchCatalogItemsQueryHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should answer with the items the DAO finds", async () => {
        jest.spyOn(container.get(CATALOG_ITEMS_DAO), "search").mockResolvedValue(ASIIMOV_FOUND);

        const response = await container
            .get(SEARCH_CATALOG_ITEMS_HANDLER)
            .handle(new SearchCatalogItemsQuery({ text: TEXT }));

        expect(response).toEqual(ASIIMOV_FOUND);
    });

    it("Should search up to the default limit when no limit is asked", async () => {
        const searchSpy = jest.spyOn(container.get(CATALOG_ITEMS_DAO), "search").mockResolvedValue(ASIIMOV_FOUND);

        await container.get(SEARCH_CATALOG_ITEMS_HANDLER).handle(new SearchCatalogItemsQuery({ text: TEXT }));

        expect(searchSpy).toHaveBeenCalledWith({ text: TEXT, limit: SearchCatalogItemsQuery.DEFAULT_LIMIT });
    });

    it("Should search up to the asked limit", async () => {
        const searchSpy = jest.spyOn(container.get(CATALOG_ITEMS_DAO), "search").mockResolvedValue(ASIIMOV_FOUND);

        await container
            .get(SEARCH_CATALOG_ITEMS_HANDLER)
            .handle(new SearchCatalogItemsQuery({ text: TEXT, limit: LIMIT }));

        expect(searchSpy).toHaveBeenCalledWith({ text: TEXT, limit: LIMIT });
    });

    it("Should be asked through the query bus", async () => {
        jest.spyOn(container.get(CATALOG_ITEMS_DAO), "search").mockResolvedValue(ASIIMOV_FOUND);

        const response = await container.get(QUERY_BUS).ask(new SearchCatalogItemsQuery({ text: TEXT }));

        expect(response).toEqual(ASIIMOV_FOUND);
    });
});
