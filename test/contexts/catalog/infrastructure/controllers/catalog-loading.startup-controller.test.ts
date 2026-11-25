import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import { CatalogUnavailableError } from "@/contexts/catalog/application/search-catalog-items/catalog-unavailable.error";
import {
    CATALOG_ITEMS_DAO,
    CATALOG_LOADING_CONTROLLER,
    CATALOG_SOURCE,
} from "@/contexts/catalog/external/di/catalog.identifiers";

const SOURCE_DOWN = new Error("The catalog source is down");
const ASIIMOV_SEARCH = { text: "asiimov", limit: 1 };

let container: Container;

describe("CatalogLoadingStartupController", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should warm the catalog cache from the source", async () => {
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

        await container.get(CATALOG_LOADING_CONTROLLER).start();

        expect((await container.get(CATALOG_ITEMS_DAO).search(ASIIMOV_SEARCH)).items).toHaveLength(1);
    });

    it("Should log a failed load instead of throwing", async () => {
        const logSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValue(SOURCE_DOWN);

        await container.get(CATALOG_LOADING_CONTROLLER).start();

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(SOURCE_DOWN.message));
    });

    it("Should leave the catalog unavailable after a failed load", async () => {
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValue(SOURCE_DOWN);
        await container.get(CATALOG_LOADING_CONTROLLER).start();

        const search = container.get(CATALOG_ITEMS_DAO).search(ASIIMOV_SEARCH);

        await expect(search).rejects.toThrow(CatalogUnavailableError);
    });
});
