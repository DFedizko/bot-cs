import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { COMMAND_BUS, LOGGER } from "@/packages/external/di/packages.identifiers";
import { LoadCatalogCommand } from "@/contexts/catalog/application/load-catalog/load-catalog.command";
import {
    CATALOG_SOURCE,
    CATALOG_STORE,
    LOAD_CATALOG_HANDLER,
} from "@/contexts/catalog/external/di/catalog.identifiers";
import { catalogRow } from "../__builders__/catalog-row.builder";

const ASIIMOV = catalogRow();
const REDLINE = catalogRow({ marketHashName: "AK-47 | Redline (Field-Tested)", weapon: "AK-47" });
const SOURCE_DOWN = new Error("The catalog source is down");

let container: Container;

describe("LoadCatalogCommandHandler", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should store every row the source gives", async () => {
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockResolvedValue([ASIIMOV, REDLINE]);

        await container.get(LOAD_CATALOG_HANDLER).handle(new LoadCatalogCommand());

        expect(container.get(CATALOG_STORE).list()).toEqual([ASIIMOV, REDLINE]);
    });

    it("Should log how many items it loaded", async () => {
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockResolvedValue([ASIIMOV, REDLINE]);
        const logSpy = jest.spyOn(container.get(LOGGER), "log");

        await container.get(LOAD_CATALOG_HANDLER).handle(new LoadCatalogCommand());

        expect(logSpy).toHaveBeenCalledWith("Catalog loaded: 2 items");
    });

    it("Should fail as the source fails", async () => {
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValue(SOURCE_DOWN);

        const loading = container.get(LOAD_CATALOG_HANDLER).handle(new LoadCatalogCommand());

        await expect(loading).rejects.toThrow(SOURCE_DOWN);
    });

    it("Should leave the catalog unloaded when the source fails", async () => {
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValue(SOURCE_DOWN);

        await container
            .get(LOAD_CATALOG_HANDLER)
            .handle(new LoadCatalogCommand())
            .catch(() => undefined);

        expect(container.get(CATALOG_STORE).isLoaded()).toBe(false);
    });

    it("Should be dispatched through the command bus", async () => {
        jest.spyOn(container.get(CATALOG_SOURCE), "load").mockResolvedValue([ASIIMOV]);

        await container.get(COMMAND_BUS).dispatch(new LoadCatalogCommand());

        expect(container.get(CATALOG_STORE).list()).toEqual([ASIIMOV]);
    });
});
