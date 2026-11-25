import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import type { CatalogRow } from "@/contexts/catalog/application/catalog-row";
import { CatalogUnavailableError } from "@/contexts/catalog/application/search-catalog-items/catalog-unavailable.error";
import { SearchCatalogItemsQuery } from "@/contexts/catalog/application/search-catalog-items/search-catalog-items.query";
import { CATALOG_ITEMS_DAO, CATALOG_STORE } from "@/contexts/catalog/external/di/catalog.identifiers";
import { catalogRow, namedRows } from "../../application/__builders__/catalog-row.builder";

const ASIIMOV = "AWP | Asiimov (Field-Tested)";
const STATTRAK_ASIIMOV = "StatTrak™ AWP | Asiimov (Field-Tested)";
const ASIIMOV_WELL_WORN = "AWP | Asiimov (Well-Worn)";
const DRAGON_LORE = "AWP | Dragon Lore (Factory New)";
const REDLINE = "AK-47 | Redline (Field-Tested)";
const KARAMBIT = "★ Karambit";
const DEFAULT_LIMIT = SearchCatalogItemsQuery.DEFAULT_LIMIT;
const TWO = 2;

const searchNames = async (container: Container, rows: CatalogRow[], text: string, limit = DEFAULT_LIMIT) => {
    await container.get(CATALOG_STORE).replaceAll(rows);
    const { items } = await container.get(CATALOG_ITEMS_DAO).search({ text, limit });
    return items.map(({ marketHashName }) => marketHashName);
};

let container: Container;

describe("CatalogItemsDaoInMemory", () => {
    beforeEach(() => {
        container = testContainer();
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
    });

    describe("limit", () => {
        it("Should find at most the asked number of items, the first in order", async () => {
            const found = await searchNames(container, namedRows(DRAGON_LORE, ASIIMOV_WELL_WORN, ASIIMOV), "awp", TWO);

            expect(found).toEqual([ASIIMOV, ASIIMOV_WELL_WORN]);
        });
    });

    describe("items", () => {
        it("Should give every detail of the items it finds", async () => {
            await container.get(CATALOG_STORE).replaceAll([catalogRow()]);

            const found = await container.get(CATALOG_ITEMS_DAO).search({ text: "asiimov", limit: DEFAULT_LIMIT });

            expect(found).toEqual({ items: [catalogRow()] });
        });

        it("Should give an item without skin or wear as nulls", async () => {
            const karambit = catalogRow({ marketHashName: KARAMBIT, weapon: "Karambit", skin: null, wear: null });
            await container.get(CATALOG_STORE).replaceAll([karambit]);

            const found = await container.get(CATALOG_ITEMS_DAO).search({ text: "karambit", limit: DEFAULT_LIMIT });

            expect(found).toEqual({ items: [karambit] });
        });

        it("Should give copies a caller can't use to change the catalog", async () => {
            await container.get(CATALOG_STORE).replaceAll([catalogRow()]);
            const dao = container.get(CATALOG_ITEMS_DAO);
            const [first] = (await dao.search({ text: "asiimov", limit: DEFAULT_LIMIT })).items;
            Object.assign(first ?? {}, { weapon: "AK-47" });

            const found = await dao.search({ text: "asiimov", limit: DEFAULT_LIMIT });

            expect(found).toEqual({ items: [catalogRow()] });
        });
    });

    describe("availability", () => {
        it("Should refuse to search before the catalog is loaded", async () => {
            const search = container.get(CATALOG_ITEMS_DAO).search({ text: "asiimov", limit: DEFAULT_LIMIT });

            await expect(search).rejects.toThrow(CatalogUnavailableError);
        });

        it("Should search an empty catalog once it is loaded", async () => {
            const found = await searchNames(container, [], "asiimov");

            expect(found).toEqual([]);
        });
    });
});
