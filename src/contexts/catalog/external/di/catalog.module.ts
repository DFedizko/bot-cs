import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { HTTP_CLIENT_FACTORY, LOGGER, QUERY_HANDLER } from "@/packages/external/di/packages.identifiers";
import type { HttpClientFactory } from "@/packages/external/http/client/http-client.factory";
import { ValidatorZodAdapter } from "@/packages/external/validation/validator.zod-adapter";
import type { Logger } from "@/packages/application/logger";
import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { CatalogSource } from "../../infrastructure/sources/catalog.source";
import type { CatalogItemsDao } from "../../application/search-catalog-items/catalog-items.dao";
import { SearchCatalogItemsQueryHandler } from "../../application/search-catalog-items/search-catalog-items.query-handler";
import type { ByMykelSkinsHttp } from "../../infrastructure/http/bymykel/bymykel-skins.http";
import type { ByMykelCatalogEntry } from "../../infrastructure/http/bymykel/types/bymykel-catalog-entry";
import { CatalogSourceByMykelAdapter } from "../../infrastructure/gateways/catalog-source.bymykel-adapter";
import { CatalogItemsDaoReadThroughCache } from "../../infrastructure/daos/catalog-items.dao.read-through-cache";
import { CatalogLoadingStartupController } from "../../infrastructure/controllers/catalog-loading.startup-controller";
import { ByMykelSkinsHttpAdapter } from "../http/bymykel/bymykel-skins.http.adapter";
import { byMykelCatalogEntrySchema } from "../validation/bymykel-catalog-entry.schema";
import {
    BYMYKEL_HTTP_CLIENT,
    BYMYKEL_SKINS_HTTP,
    CATALOG_CACHE,
    CATALOG_ENTRY_VALIDATOR,
    CATALOG_ITEMS_DAO,
    CATALOG_LOADING_CONTROLLER,
    CATALOG_SOURCE,
    SEARCH_CATALOG_ITEMS_HANDLER,
} from "./catalog.identifiers";

export class CatalogModule extends ContainerModule {
    constructor() {
        super((options) => CatalogModule.bindAll(options));
    }

    private static bindAll(options: ContainerModuleLoadOptions): void {
        CatalogModule.bindSource(options);
        CatalogModule.bindStorage(options);
        CatalogModule.bindHandlers(options);
    }

    private static bindSource({ bind }: ContainerModuleLoadOptions): void {
        bind(BYMYKEL_HTTP_CLIENT)
            .toResolvedValue(
                (factory: HttpClientFactory) => factory.create(ByMykelSkinsHttpAdapter.BASE_URL),
                [HTTP_CLIENT_FACTORY],
            )
            .inSingletonScope();
        bind(BYMYKEL_SKINS_HTTP)
            .toResolvedValue((client: HttpClient) => new ByMykelSkinsHttpAdapter(client), [BYMYKEL_HTTP_CLIENT])
            .inSingletonScope();
        bind(CATALOG_ENTRY_VALIDATOR)
            .toResolvedValue(() => new ValidatorZodAdapter(byMykelCatalogEntrySchema))
            .inSingletonScope();
        bind(CATALOG_SOURCE)
            .toResolvedValue(
                (http: ByMykelSkinsHttp, validator: Validator<ByMykelCatalogEntry>, logger: Logger) =>
                    new CatalogSourceByMykelAdapter(http, validator, logger),
                [BYMYKEL_SKINS_HTTP, CATALOG_ENTRY_VALIDATOR, LOGGER],
            )
            .inSingletonScope();
    }

    private static bindStorage({ bind }: ContainerModuleLoadOptions): void {
        bind(CATALOG_CACHE)
            .toResolvedValue(
                (source: CatalogSource, logger: Logger) => new CatalogItemsDaoReadThroughCache(source, logger),
                [CATALOG_SOURCE, LOGGER],
            )
            .inSingletonScope();
        bind(CATALOG_ITEMS_DAO).toService(CATALOG_CACHE);
    }

    private static bindHandlers({ bind }: ContainerModuleLoadOptions): void {
        bind(SEARCH_CATALOG_ITEMS_HANDLER)
            .toResolvedValue((dao: CatalogItemsDao) => new SearchCatalogItemsQueryHandler(dao), [CATALOG_ITEMS_DAO])
            .inSingletonScope();
        bind(QUERY_HANDLER).toService(SEARCH_CATALOG_ITEMS_HANDLER);
        bind(CATALOG_LOADING_CONTROLLER)
            .toResolvedValue(
                (cache: CatalogItemsDaoReadThroughCache) => new CatalogLoadingStartupController(cache),
                [CATALOG_CACHE],
            )
            .inSingletonScope();
    }
}
