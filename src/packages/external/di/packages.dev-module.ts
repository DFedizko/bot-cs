import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";
import type { ApiDocument } from "@/packages/infrastructure/http/docs/api-document";
import type { ApiReferencePage } from "@/packages/infrastructure/http/docs/api-reference.page";
import type { HttpRouteCatalog } from "@/packages/infrastructure/http/docs/http-route.catalog";
import { ApiDocumentHttpController } from "@/packages/infrastructure/http/docs/api-document.http-controller";
import { ApiReferenceHttpController } from "@/packages/infrastructure/http/docs/api-reference.http-controller";
import { ApiDocumentZodOpenApiAdapter } from "../openapi/api-document.zod-openapi-adapter";
import { ApiReferenceScalarAdapter } from "../openapi/api-reference.scalar-adapter";
import {
    API_DOCUMENT,
    API_DOCUMENT_CONTROLLER,
    API_REFERENCE_CONTROLLER,
    API_REFERENCE_PAGE,
    HTTP_CONTROLLER,
    HTTP_ROUTE_CATALOG,
    HTTP_SERVER,
} from "./packages.identifiers";

const API_INFO = {
    title: "bot-cs API",
    version: "1.0.0",
    description: "The HTTP API of bot-cs.",
};

export class PackagesDevModule extends ContainerModule {
    constructor() {
        super((options) => PackagesDevModule.bindAll(options));
    }

    private static bindAll({ bind }: ContainerModuleLoadOptions): void {
        bind(API_DOCUMENT)
            .toResolvedValue(
                (catalog: HttpRouteCatalog) => new ApiDocumentZodOpenApiAdapter(catalog, API_INFO),
                [HTTP_ROUTE_CATALOG],
            )
            .inSingletonScope();
        bind(API_REFERENCE_PAGE)
            .toResolvedValue(() => new ApiReferenceScalarAdapter(API_INFO.title))
            .inSingletonScope();
        bind(API_DOCUMENT_CONTROLLER)
            .toResolvedValue(
                (http: HttpServer, document: ApiDocument) => new ApiDocumentHttpController(http, document),
                [HTTP_SERVER, API_DOCUMENT],
            )
            .inSingletonScope();
        bind(API_REFERENCE_CONTROLLER)
            .toResolvedValue(
                (http: HttpServer, page: ApiReferencePage) => new ApiReferenceHttpController(http, page),
                [HTTP_SERVER, API_REFERENCE_PAGE],
            )
            .inSingletonScope();
        bind(HTTP_CONTROLLER).toService(API_DOCUMENT_CONTROLLER);
        bind(HTTP_CONTROLLER).toService(API_REFERENCE_CONTROLLER);
    }
}
