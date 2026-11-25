import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { LOGGER } from "@/packages/external/di/packages.identifiers";
import type { CatalogRow } from "@/contexts/catalog/infrastructure/sources/catalog.source";
import { CatalogUnavailableError } from "@/contexts/catalog/application/search-catalog-items/catalog-unavailable.error";
import { SearchCatalogItemsQuery } from "@/contexts/catalog/application/search-catalog-items/search-catalog-items.query";
import { CATALOG_CACHE, CATALOG_ITEMS_DAO, CATALOG_SOURCE } from "@/contexts/catalog/external/di/catalog.identifiers";
import { catalogRow, namedRows } from "../../__builders__/catalog-row.builder";

const ASIIMOV = "AWP | Asiimov (Field-Tested)";
const STATTRAK_ASIIMOV = "StatTrak™ AWP | Asiimov (Field-Tested)";
const ASIIMOV_WELL_WORN = "AWP | Asiimov (Well-Worn)";
const DRAGON_LORE = "AWP | Dragon Lore (Factory New)";
const REDLINE = "AK-47 | Redline (Field-Tested)";
const KARAMBIT = "★ Karambit";
const DEFAULT_LIMIT = SearchCatalogItemsQuery.DEFAULT_LIMIT;
const TWO = 2;
const SOURCE_DOWN = new Error("The catalog source is down");
const ASIIMOV_SEARCH = { text: "asiimov", limit: DEFAULT_LIMIT };

const sourceGives = (container: Container, rows: CatalogRow[]) =>
    jest.spyOn(container.get(CATALOG_SOURCE), "load").mockResolvedValue(rows);

const warmedWith = async (container: Container, rows: CatalogRow[]) => {
    sourceGives(container, rows);
    await container.get(CATALOG_CACHE).warmUp();
    return container.get(CATALOG_ITEMS_DAO);
};

const searchNames = async (container: Container, rows: CatalogRow[], text: string, limit = DEFAULT_LIMIT) => {
    const { items } = await (await warmedWith(container, rows)).search({ text, limit });
    return items.map(({ marketHashName }) => marketHashName);
};

let container: Container;

describe("CatalogItemsDaoReadThroughCache", () => {
    beforeEach(() => {
        container = testContainer();
        jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    });

    describe("matching", () => {
        it("Should find the items whose market name holds every word of the text", async () => {
            const found = await searchNames(container, namedRows(ASIIMOV, DRAGON_LORE, REDLINE), "awp asii");

            expect(found).toEqual([ASIIMOV]);
        });

        it("Should ignore the case of the text and of the market name", async () => {
            const found = await searchNames(container, namedRows(ASIIMOV), "AwP AsIi");

            expect(found).toEqual([ASIIMOV]);
        });

        it("Should find the words in any order", async () => {
            const found = await searchNames(container, namedRows(ASIIMOV, DRAGON_LORE), "asiimov awp");

            expect(found).toEqual([ASIIMOV]);
        });

        it("Should ignore the bars and parentheses of the text and of the market name", async () => {
            const rows = namedRows(ASIIMOV, ASIIMOV_WELL_WORN);

            const found = await searchNames(container, rows, "awp | asiimov (field-tested)");

            expect(found).toEqual([ASIIMOV]);
        });

        it("Should find nothing when one word of the text is missing", async () => {
            const found = await searchNames(container, namedRows(ASIIMOV, REDLINE), "awp redline");

            expect(found).toEqual([]);
        });

        it("Should find nothing for a text made only of ignored symbols", async () => {
            const found = await searchNames(container, namedRows(ASIIMOV, REDLINE), "| ( )");

            expect(found).toEqual([]);
        });

        it("Should find names with symbols the text doesn't type", async () => {
            const found = await searchNames(container, namedRows(KARAMBIT, REDLINE), "karambit");

            expect(found).toEqual([KARAMBIT]);
        });
    });

    describe("ordering", () => {
        it("Should list the names that start with the text first, then the rest", async () => {
            const found = await searchNames(container, namedRows(STATTRAK_ASIIMOV, ASIIMOV), "awp asiimov");

            expect(found).toEqual([ASIIMOV, STATTRAK_ASIIMOV]);
        });

        it("Should list each group alphabetically", async () => {
            const rows = namedRows(DRAGON_LORE, STATTRAK_ASIIMOV, ASIIMOV_WELL_WORN, ASIIMOV);

            const found = await searchNames(container, rows, "awp");

            expect(found).toEqual([ASIIMOV, ASIIMOV_WELL_WORN, DRAGON_LORE, STATTRAK_ASIIMOV]);
        });

        it("Should find at most the asked number of items, the first in order", async () => {
            const found = await searchNames(container, namedRows(DRAGON_LORE, ASIIMOV_WELL_WORN, ASIIMOV), "awp", TWO);

            expect(found).toEqual([ASIIMOV, ASIIMOV_WELL_WORN]);
        });
    });

    describe("items", () => {
        it("Should give every detail of the items it finds", async () => {
            const dao = await warmedWith(container, [catalogRow()]);

            const found = await dao.search(ASIIMOV_SEARCH);

            expect(found).toEqual({ items: [catalogRow()] });
        });

        it("Should give an item without skin or wear as nulls", async () => {
            const karambit = catalogRow({ marketHashName: KARAMBIT, weapon: "Karambit", skin: null, wear: null });
            const dao = await warmedWith(container, [karambit]);

            const found = await dao.search({ text: "karambit", limit: DEFAULT_LIMIT });

            expect(found).toEqual({ items: [karambit] });
        });

        it("Should give copies a caller can't use to change the catalog", async () => {
            const dao = await warmedWith(container, [catalogRow()]);
            const [first] = (await dao.search(ASIIMOV_SEARCH)).items;
            Object.assign(first ?? {}, { weapon: "AK-47" });

            const found = await dao.search(ASIIMOV_SEARCH);

            expect(found).toEqual({ items: [catalogRow()] });
        });

        it("Should keep its own copy of the rows the source gave", async () => {
            const row = catalogRow();
            const dao = await warmedWith(container, [row]);
            Object.assign(row, { weapon: "AK-47" });

            const found = await dao.search(ASIIMOV_SEARCH);

            expect(found).toEqual({ items: [catalogRow()] });
        });

        it("Should search an empty catalog once it is loaded", async () => {
            const found = await searchNames(container, [], "asiimov");

            expect(found).toEqual([]);
        });
    });

    describe("caching", () => {
        it("Should refuse to search before the catalog is loaded", async () => {
            sourceGives(container, [catalogRow()]);

            const search = container.get(CATALOG_ITEMS_DAO).search(ASIIMOV_SEARCH);

            await expect(search).rejects.toThrow(CatalogUnavailableError);
        });

        it("Should start loading the catalog when searched before it is loaded", async () => {
            const loadSpy = sourceGives(container, [catalogRow()]);

            await container
                .get(CATALOG_ITEMS_DAO)
                .search(ASIIMOV_SEARCH)
                .catch(() => undefined);

            expect(loadSpy).toHaveBeenCalledTimes(1);
        });

        it("Should download the catalog once, whatever the number of searches", async () => {
            const dao = await warmedWith(container, [catalogRow()]);

            await Promise.all([dao.search(ASIIMOV_SEARCH), dao.search(ASIIMOV_SEARCH)]);

            expect(container.get(CATALOG_SOURCE).load).toHaveBeenCalledTimes(1);
        });

        it("Should share one download between warm-ups made at the same time", async () => {
            const loadSpy = sourceGives(container, [catalogRow()]);
            const cache = container.get(CATALOG_CACHE);

            await Promise.all([cache.warmUp(), cache.warmUp()]);

            expect(loadSpy).toHaveBeenCalledTimes(1);
        });

        it("Should log how many items it loaded", async () => {
            const logSpy = jest.spyOn(container.get(LOGGER), "log");

            await warmedWith(container, namedRows(ASIIMOV, REDLINE));

            expect(logSpy).toHaveBeenCalledWith("Catalog loaded: 2 items");
        });

        it("Should log a failed load instead of throwing", async () => {
            const logSpy = jest.spyOn(container.get(LOGGER), "log");
            jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValue(SOURCE_DOWN);

            await container.get(CATALOG_CACHE).warmUp();

            expect(logSpy).toHaveBeenCalledWith("Could not load the catalog: The catalog source is down");
        });

        it("Should stay unavailable after a failed load", async () => {
            jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValue(SOURCE_DOWN);
            await container.get(CATALOG_CACHE).warmUp();

            const search = container.get(CATALOG_ITEMS_DAO).search(ASIIMOV_SEARCH);

            await expect(search).rejects.toThrow(CatalogUnavailableError);
        });

        it("Should load again on the next warm-up after a failed load", async () => {
            jest.spyOn(container.get(CATALOG_SOURCE), "load").mockRejectedValueOnce(SOURCE_DOWN);
            await container.get(CATALOG_CACHE).warmUp();

            const dao = await warmedWith(container, [catalogRow()]);

            expect(await dao.search(ASIIMOV_SEARCH)).toEqual({ items: [catalogRow()] });
        });
    });
});
