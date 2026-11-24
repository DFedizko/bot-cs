import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import {
    CATALOG_LOADING_CONTROLLER,
    CATALOG_SOURCE,
    CATALOG_STORE,
} from "@/contexts/catalog/external/di/catalog.identifiers";

const SOURCE_DOWN = new Error("The catalog source is down");

let container: Container;

describe("CatalogLoadingStartupController", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should load the catalog from the source", async () => {
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});

        await container.get(CATALOG_LOADING_CONTROLLER).start();

        expect(container.get(CATALOG_STORE).isLoaded()).toBe(true);
    });

    it("Should log a failed load instead of throwing", async () => {
        const logSpy = jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValue(SOURCE_DOWN);

        await container.get(CATALOG_LOADING_CONTROLLER).start();

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(`Command "load_catalog" failed (trigger=startup)`));
    });

    it("Should leave the catalog unloaded after a failed load", async () => {
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValue(SOURCE_DOWN);

        await container.get(CATALOG_LOADING_CONTROLLER).start();

        expect(container.get(CATALOG_STORE).isLoaded()).toBe(false);
    });
});
