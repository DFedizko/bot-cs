import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { CATALOG_STORE } from "@/contexts/catalog/external/di/catalog.identifiers";
import { catalogRow } from "../../application/__builders__/catalog-row.builder";

const ASIIMOV = catalogRow();
const REDLINE = catalogRow({ marketHashName: "AK-47 | Redline (Field-Tested)", weapon: "AK-47" });

let container: Container;

describe("CatalogStoreInMemory", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should start with a catalog that is not loaded", () => {
        const store = container.get(CATALOG_STORE);

        expect(store.isLoaded()).toBe(false);
    });

    it("Should mark the catalog as loaded once its rows are saved", async () => {
        await container.get(CATALOG_STORE).replaceAll([ASIIMOV]);

        expect(container.get(CATALOG_STORE).isLoaded()).toBe(true);
    });

    it("Should keep every saved row in order", async () => {
        await container.get(CATALOG_STORE).replaceAll([ASIIMOV, REDLINE]);

        expect(container.get(CATALOG_STORE).list()).toEqual([ASIIMOV, REDLINE]);
    });

    it("Should replace the rows saved before", async () => {
        const store = container.get(CATALOG_STORE);
        await store.replaceAll([ASIIMOV]);

        await store.replaceAll([REDLINE]);

        expect(store.list()).toEqual([REDLINE]);
    });

    it("Should keep copies a caller can't use to change the catalog", async () => {
        const store = container.get(CATALOG_STORE);
        const row = catalogRow();
        await store.replaceAll([row]);

        Object.assign(row, { weapon: "AK-47" });

        expect(store.list()).toEqual([ASIIMOV]);
    });
});
