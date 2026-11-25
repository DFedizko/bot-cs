import type { CatalogRow } from "../catalog-row";

export interface CatalogSource {
    load(): Promise<CatalogRow[]>;
}
