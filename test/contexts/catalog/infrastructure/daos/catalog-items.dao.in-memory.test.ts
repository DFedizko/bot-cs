import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { CatalogItem } from "@/contexts/catalog/domain/catalog-item/catalog-item";
import { CatalogUnavailableError } from "@/contexts/catalog/application/search-catalog-items/catalog-unavailable.error";
import { CATALOG_ITEMS_DAO, CATALOG_REPOSITORY } from "@/contexts/catalog/external/di/catalog.identifiers";
import { catalogItemPrimitives } from "../../domain/catalog-item/__builders__/catalog-item.builder";

const ASIIMOV = catalogItemPrimitives();
const STATTRAK_ASIIMOV = catalogItemPrimitives({
    marketHashName: "StatTrak™ AWP | Asiimov (Field-Tested)",
    stattrak: true,
});
const KARAMBIT = catalogItemPrimitives({ marketHashName: "★ Karambit", weapon: "Karambit", skin: null, wear: null });
const DEFAULT_LIMIT = 20;
const ONE = 1;

const saveCatalog = (container: Container, ...items: (typeof ASIIMOV)[]) =>
    container.get(CATALOG_REPOSITORY).saveAll(items.map((item) => CatalogItem.create(item)));

let container: Container;

describe("CatalogItemsDaoInMemory", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should find the saved items that match the text, in the search order", async () => {
        await saveCatalog(container, STATTRAK_ASIIMOV, KARAMBIT, ASIIMOV);

        const found = await container.get(CATALOG_ITEMS_DAO).search({ text: "awp asii", limit: DEFAULT_LIMIT });

        expect(found).toEqual({ items: [ASIIMOV, STATTRAK_ASIIMOV] });
    });

    it("Should find at most the asked number of items", async () => {
        await saveCatalog(container, STATTRAK_ASIIMOV, ASIIMOV);

        const found = await container.get(CATALOG_ITEMS_DAO).search({ text: "asiimov", limit: ONE });

        expect(found).toEqual({ items: [ASIIMOV] });
    });

    it("Should give an item without skin or wear as nulls", async () => {
        await saveCatalog(container, KARAMBIT);

        const found = await container.get(CATALOG_ITEMS_DAO).search({ text: "karambit", limit: DEFAULT_LIMIT });

        expect(found).toEqual({ items: [KARAMBIT] });
    });

    it("Should find nothing when no item matches", async () => {
        await saveCatalog(container, ASIIMOV);

        const found = await container.get(CATALOG_ITEMS_DAO).search({ text: "dragon lore", limit: DEFAULT_LIMIT });

        expect(found).toEqual({ items: [] });
    });

    it("Should give copies a caller can't use to change the catalog", async () => {
        await saveCatalog(container, ASIIMOV);
        const dao = container.get(CATALOG_ITEMS_DAO);
        const [first] = (await dao.search({ text: "asiimov", limit: DEFAULT_LIMIT })).items;
        Object.assign(first ?? {}, { weapon: "AK-47" });

        const found = await dao.search({ text: "asiimov", limit: DEFAULT_LIMIT });

        expect(found).toEqual({ items: [ASIIMOV] });
    });

    it("Should refuse to search before the catalog is loaded", async () => {
        const search = container.get(CATALOG_ITEMS_DAO).search({ text: "asiimov", limit: DEFAULT_LIMIT });

        await expect(search).rejects.toThrow(CatalogUnavailableError);
    });

    it("Should search an empty catalog once it is loaded", async () => {
        await saveCatalog(container);

        const found = await container.get(CATALOG_ITEMS_DAO).search({ text: "asiimov", limit: DEFAULT_LIMIT });

        expect(found).toEqual({ items: [] });
    });
});
