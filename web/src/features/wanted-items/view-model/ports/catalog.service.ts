import { definePort } from "@/shared/lib/define-port";
import type { CatalogItem } from "../../model/catalog-item";

const CATALOG_SERVICE_PORT = "CatalogService";

export interface CatalogService {
    search: (query: string) => Promise<Array<CatalogItem>>;
}

export const { Provider: CatalogServiceProvider, usePort: useCatalogService } =
    definePort<CatalogService>(CATALOG_SERVICE_PORT);
