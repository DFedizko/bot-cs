import type z from "zod";
import type { ApiDocument } from "@/packages/infrastructure/http/docs/api-document";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import type { OpenApiDocument, OpenApiInfo, OpenApiOperation } from "./openapi-document";
import { OpenApiOperationFactory } from "./openapi-operation.factory";

const OPENAPI_VERSION = "3.1.0";

type ZodRoute = HttpRouteDoc<z.ZodObject>;
type PathItems = OpenApiDocument["paths"];

export class ApiDocumentZodAdapter implements ApiDocument {
    constructor(
        private readonly routes: ZodRoute[],
        private readonly info: OpenApiInfo,
    ) {}

    build(): OpenApiDocument {
        return { openapi: OPENAPI_VERSION, info: this.info, paths: this.routes.reduce(this.addRoute, {}) };
    }

    toJson(): OpenApiDocument {
        return this.build();
    }

    private addRoute(paths: PathItems, route: ZodRoute): PathItems {
        const path = OpenApiOperationFactory.toOpenApiPath(route.path);
        const operation: OpenApiOperation = OpenApiOperationFactory.create(route);
        return { ...paths, [path]: { ...paths[path], [route.method]: operation } };
    }
}
