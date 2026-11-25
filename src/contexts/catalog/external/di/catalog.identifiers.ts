import { identifier } from "@/packages/external/di/identifier";
import type { QueryHandler } from "@/packages/building-blocks/query-handler";
import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { CatalogItemsDao } from "../../application/search-catalog-items/catalog-items.dao";
import type { SearchCatalogItemsQuery } from "../../application/search-catalog-items/search-catalog-items.query";
import type { SearchCatalogItemsResponse } from "../../application/search-catalog-items/search-catalog-items.response";
import type { CatalogSource } from "../../infrastructure/sources/catalog.source";
import type { CatalogItemsDaoReadThroughCache } from "../../infrastructure/daos/catalog-items.dao.read-through-cache";
import type { ByMykelSkinsHttp } from "../../infrastructure/http/bymykel/bymykel-skins.http";
import type {
    SearchCatalogItemsHttpController,
    SearchCatalogItemsInput,
} from "../../infrastructure/controllers/search-catalog-items.http-controller";
import type { CatalogLoadingStartupController } from "../../infrastructure/controllers/catalog-loading.startup-controller";
import type { ByMykelCatalogEntry } from "../../infrastructure/http/bymykel/types/bymykel-catalog-entry";

export const BYMYKEL_HTTP_CLIENT = identifier<HttpClient>("ByMykelHttpClient");
export const BYMYKEL_SKINS_HTTP = identifier<ByMykelSkinsHttp>("ByMykelSkinsHttp");
export const CATALOG_ENTRY_VALIDATOR = identifier<Validator<ByMykelCatalogEntry>>("CatalogEntryValidator");
export const CATALOG_SOURCE = identifier<CatalogSource>("CatalogSource");
export const CATALOG_CACHE = identifier<CatalogItemsDaoReadThroughCache>("CatalogCache");
export const CATALOG_ITEMS_DAO = identifier<CatalogItemsDao>("CatalogItemsDao");

export const SEARCH_CATALOG_ITEMS_HANDLER =
    identifier<QueryHandler<SearchCatalogItemsQuery, SearchCatalogItemsResponse>>("SearchCatalogItemsHandler");

export const SEARCH_CATALOG_ITEMS_VALIDATOR =
    identifier<Validator<SearchCatalogItemsInput>>("SearchCatalogItemsValidator");
export const SEARCH_CATALOG_ITEMS_CONTROLLER = identifier<SearchCatalogItemsHttpController>(
    "SearchCatalogItemsHttpController",
);
export const CATALOG_LOADING_CONTROLLER = identifier<CatalogLoadingStartupController>("CatalogLoadingController");
