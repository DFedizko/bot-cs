import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import {
    HTTP_CONTROLLER,
    HTTP_ERROR_MAPPING,
    HTTP_SERVER,
    QUERY_BUS,
} from "@/packages/external/di/packages.identifiers";
import { ValidatorZodAdapter } from "@/packages/external/validation/validator.zod-adapter";
import type { QueryBus } from "@/packages/application/query-bus";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import { CatalogUnavailableError } from "../../application/search-catalog-items/catalog-unavailable.error";
import {
    SearchCatalogItemsHttpController,
    type SearchCatalogItemsInput,
} from "../../infrastructure/controllers/search-catalog-items.http-controller";
import { searchCatalogItemsDoc } from "../../infrastructure/docs/search-catalog-items.route-doc";
import { searchCatalogItemsSchema } from "../validation/search-catalog-items.schema";
import { searchCatalogItemsResponseSchema } from "../validation/search-catalog-items.response-schema";
import { SEARCH_CATALOG_ITEMS_CONTROLLER, SEARCH_CATALOG_ITEMS_VALIDATOR } from "./catalog.identifiers";

export class CatalogHttpModule extends ContainerModule {
    private static readonly SEARCH_DOC = searchCatalogItemsDoc(
        new ValidatorZodAdapter(searchCatalogItemsResponseSchema),
    );

    constructor() {
        super((options) => CatalogHttpModule.bindAll(options));
    }

    private static bindAll({ bind }: ContainerModuleLoadOptions): void {
        bind(SEARCH_CATALOG_ITEMS_VALIDATOR)
            .toResolvedValue(() => new ValidatorZodAdapter(searchCatalogItemsSchema))
            .inSingletonScope();
        bind(SEARCH_CATALOG_ITEMS_CONTROLLER)
            .toResolvedValue(
                (http: HttpServer, bus: QueryBus, validator: Validator<SearchCatalogItemsInput>) =>
                    new SearchCatalogItemsHttpController(http, bus, validator, CatalogHttpModule.SEARCH_DOC),
                [HTTP_SERVER, QUERY_BUS, SEARCH_CATALOG_ITEMS_VALIDATOR],
            )
            .inSingletonScope();
        bind(HTTP_CONTROLLER).toService(SEARCH_CATALOG_ITEMS_CONTROLLER);
        bind(HTTP_ERROR_MAPPING).toConstantValue({
            error: CatalogUnavailableError,
            status: HttpStatus.SERVICE_UNAVAILABLE,
        });
    }
}
