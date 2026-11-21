import z from "zod";
import {
    createDocument,
    type ZodOpenApiOperationObject,
    type ZodOpenApiPathsObject,
    type ZodOpenApiResponseObject,
} from "zod-openapi";
import type { ApiDocument, ApiDocumentJson } from "@/packages/infrastructure/http/docs/api-document";
import type { HttpRouteCatalog } from "@/packages/infrastructure/http/docs/http-route.catalog";
import type { HttpResponseDoc, HttpRoute, HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { ValidatorZodAdapter } from "../validation/validator.zod-adapter";
import { httpErrorBodySchema } from "./http-error-body.schema";

const OPENAPI_VERSION = "3.1.0";
const PATH_PARAM = /:(\w+)/g;
const PARAM_PREFIX_LENGTH = 1;
const FIRST_ERROR_STATUS = 400;

type ApiInfo = { title: string; version: string; description: string };
type DocumentedRoute = HttpRoute & { doc: HttpRouteDoc };

export class ApiDocumentZodOpenApiAdapter implements ApiDocument {
    private document?: ApiDocumentJson;

    constructor(
        private readonly catalog: HttpRouteCatalog,
        private readonly info: ApiInfo,
    ) {}

    toJson(): ApiDocumentJson {
        this.document ??= {
            ...createDocument({ openapi: OPENAPI_VERSION, info: this.info, paths: this.createPaths() }),
        };
        return this.document;
    }

    private createPaths(): ZodOpenApiPathsObject {
        const routes = this.catalog.routes().filter((route): route is DocumentedRoute => route.doc !== undefined);
        return routes.reduce((paths, route) => this.addRoute(paths, route), {} as ZodOpenApiPathsObject);
    }

    private addRoute(paths: ZodOpenApiPathsObject, route: DocumentedRoute): ZodOpenApiPathsObject {
        const path = route.path.replace(PATH_PARAM, (_match, name: string) => `{${name}}`);
        return { ...paths, [path]: { ...paths[path], [route.method]: this.createOperation(route) } };
    }

    private createOperation({ doc, input, path }: DocumentedRoute): ZodOpenApiOperationObject {
        const shape = this.readShape(input);
        const params = this.readParamNames(path);
        const body = Object.entries(shape).filter(([name]) => !params.includes(name));
        const { summary, description, tags } = doc;
        return {
            summary,
            description,
            tags,
            requestParams: { path: z.object(Object.fromEntries(params.map((name) => [name, shape[name]]))) },
            ...(body.length > 0 && {
                requestBody: { content: { "application/json": { schema: z.object(Object.fromEntries(body)) } } },
            }),
            responses: Object.fromEntries(doc.responses.map((response) => this.createResponse(response))),
        };
    }

    private readShape(input: HttpRoute["input"]): z.ZodRawShape {
        const isZodObject = input instanceof ValidatorZodAdapter && input.schema instanceof z.ZodObject;
        return isZodObject ? input.schema.shape : {};
    }

    private createResponse({ status, description, examples }: HttpResponseDoc): [string, ZodOpenApiResponseObject] {
        if (status < FIRST_ERROR_STATUS) return [String(status), { description }];
        const content = { "application/json": { schema: httpErrorBodySchema, ...(examples && { examples }) } };
        return [String(status), { description, content }];
    }

    private readParamNames(path: string): string[] {
        return [...path.matchAll(PATH_PARAM)].map(([match]) => match.slice(PARAM_PREFIX_LENGTH));
    }
}
