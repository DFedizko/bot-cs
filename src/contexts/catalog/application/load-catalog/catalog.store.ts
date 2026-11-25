import type { CatalogRow } from "../catalog-row";

export interface CatalogStore {
    replaceAll(rows: CatalogRow[]): Promise<void>;
}
