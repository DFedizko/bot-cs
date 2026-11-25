import type { CatalogRow } from "../../application/catalog-row";
import type { CatalogStore } from "../../application/load-catalog/catalog.store";

export class CatalogStoreInMemory implements CatalogStore {
    private rows: readonly CatalogRow[] = [];
    private loaded = false;

    async replaceAll(rows: CatalogRow[]): Promise<void> {
        this.rows = rows.map((row) => ({ ...row }));
        this.loaded = true;
    }

    isLoaded(): boolean {
        return this.loaded;
    }

    list(): readonly CatalogRow[] {
        return this.rows;
    }
}
