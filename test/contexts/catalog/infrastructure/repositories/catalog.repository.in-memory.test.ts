import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { CatalogItem } from "@/contexts/catalog/domain/catalog-item/catalog-item";
import { CATALOG_REPOSITORY, CATALOG_STORE } from "@/contexts/catalog/external/di/catalog.identifiers";
import { catalogItemPrimitives } from "../../domain/catalog-item/__builders__/catalog-item.builder";

const ASIIMOV = catalogItemPrimitives();
const REDLINE = catalogItemPrimitives({ marketHashName: "AK-47 | Redline (Field-Tested)", weapon: "AK-47" });
const DOPPLER = "★ Karambit | Doppler (Factory New)";
const PHASE_ONE = catalogItemPrimitives({ marketHashName: DOPPLER, imageUrl: "https://example.com/phase-1" });
const PHASE_TWO = catalogItemPrimitives({ marketHashName: DOPPLER, imageUrl: "https://example.com/phase-2" });

const itemsOf = (...items: (typeof ASIIMOV)[]) => items.map((item) => CatalogItem.create(item));

let container: Container;

describe("CatalogRepositoryInMemory", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should mark the catalog as loaded once saved", async () => {
        await container.get(CATALOG_REPOSITORY).saveAll(itemsOf(ASIIMOV));

        expect(container.get(CATALOG_STORE).isLoaded()).toBe(true);
    });

    it("Should start with a catalog that is not loaded", () => {
        const store = container.get(CATALOG_STORE);

        expect(store.isLoaded()).toBe(false);
    });

    it("Should store every saved item as primitives", async () => {
        await container.get(CATALOG_REPOSITORY).saveAll(itemsOf(ASIIMOV, REDLINE));

        expect(container.get(CATALOG_STORE).list()).toEqual([ASIIMOV, REDLINE]);
    });

    it("Should replace the catalog saved before", async () => {
        const repository = container.get(CATALOG_REPOSITORY);
        await repository.saveAll(itemsOf(ASIIMOV));

        await repository.saveAll(itemsOf(REDLINE));

        expect(container.get(CATALOG_STORE).list()).toEqual([REDLINE]);
    });

    it("Should keep the first item of a market name listed more than once", async () => {
        await container.get(CATALOG_REPOSITORY).saveAll(itemsOf(PHASE_ONE, PHASE_TWO));

        expect(container.get(CATALOG_STORE).list()).toEqual([PHASE_ONE]);
    });
});
