import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import type { CatalogRow } from "@/contexts/catalog/infrastructure/sources/catalog.source";
import { CATALOG_CACHE, CATALOG_LOOKUP, CATALOG_SOURCE } from "@/contexts/catalog/external/di/catalog.identifiers";
import { catalogRow, namedRows } from "../../__builders__/catalog-row.builder";

const ASIIMOV = "AWP | Asiimov (Field-Tested)";
const REDLINE = "AK-47 | Redline (Field-Tested)";
const VULCAN = "AK-47 | Vulcan (Field-Tested)";
const UNKNOWN = "Not A Real Item";
const SOURCE_DOWN = new Error("The catalog source is down");

const sourceGives = (container: Container, rows: CatalogRow[]) =>
    jest.spyOn(container.get(CATALOG_SOURCE), "load").mockResolvedValue(rows);

const warmedWith = async (container: Container, rows: CatalogRow[]) => {
    sourceGives(container, rows);
    await container.get(CATALOG_CACHE).warmUp();
    return container.get(CATALOG_LOOKUP);
};

const foundNames = async (container: Container, rows: CatalogRow[], names: string[]) => {
    const { items } = await (await warmedWith(container, rows)).findByNames(names);
    return items.map(({ marketHashName }) => marketHashName);
};

let container: Container;

describe("CatalogItemsDaoMemoryCache as the catalog lookup", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    it("Should find the items of the market names it knows", async () => {
        const found = await foundNames(container, namedRows(ASIIMOV, REDLINE, VULCAN), [ASIIMOV, VULCAN]);

        expect(found).toEqual([ASIIMOV, VULCAN]);
    });

    it("Should give every detail of the items it finds", async () => {
        const lookup = await warmedWith(container, [catalogRow()]);

        const found = await lookup.findByNames([ASIIMOV]);

        expect(found).toEqual({ items: [catalogRow()] });
    });

    it("Should skip the market names it doesn't know", async () => {
        const found = await foundNames(container, namedRows(ASIIMOV), [UNKNOWN, ASIIMOV]);

        expect(found).toEqual([ASIIMOV]);
    });

    it("Should match the market names exactly", async () => {
        const found = await foundNames(container, namedRows(ASIIMOV), [ASIIMOV.toLowerCase(), "AWP"]);

        expect(found).toEqual([]);
    });

    it("Should give each item once, even when asked for twice", async () => {
        const found = await foundNames(container, namedRows(ASIIMOV), [ASIIMOV, ASIIMOV]);

        expect(found).toEqual([ASIIMOV]);
    });

    it("Should find nothing for no names", async () => {
        const found = await foundNames(container, namedRows(ASIIMOV), []);

        expect(found).toEqual([]);
    });

    it("Should find nothing, without failing, before the catalog is loaded", async () => {
        sourceGives(container, [catalogRow()]);

        const found = await container.get(CATALOG_LOOKUP).findByNames([ASIIMOV]);

        expect(found).toEqual({ items: [] });
    });

    it("Should start loading the catalog when looked up before it is loaded", async () => {
        const loadSpy = sourceGives(container, [catalogRow()]);

        await container.get(CATALOG_LOOKUP).findByNames([ASIIMOV]);

        expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it("Should find the items once a lookup's load has finished", async () => {
        sourceGives(container, [catalogRow()]);
        await container.get(CATALOG_LOOKUP).findByNames([ASIIMOV]);
        await container.get(CATALOG_CACHE).warmUp();

        const found = await container.get(CATALOG_LOOKUP).findByNames([ASIIMOV]);

        expect(found).toEqual({ items: [catalogRow()] });
    });

    it("Should download the catalog again when looked up after a failed load", async () => {
        const loadSpy = jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValue(SOURCE_DOWN);
        await container.get(CATALOG_CACHE).warmUp();

        await container.get(CATALOG_LOOKUP).findByNames([ASIIMOV]);

        expect(loadSpy).toHaveBeenCalledTimes(2);
    });

    it("Should give copies a caller can't use to change the catalog", async () => {
        const lookup = await warmedWith(container, [catalogRow()]);
        const [first] = (await lookup.findByNames([ASIIMOV])).items;
        Object.assign(first ?? {}, { weapon: "AK-47" });

        const found = await lookup.findByNames([ASIIMOV]);

        expect(found).toEqual({ items: [catalogRow()] });
    });
});
