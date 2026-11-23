import z from "zod";
import {
    createDocument,
    type ZodOpenApiObject,
    type ZodOpenApiOperationObject,
    type ZodOpenApiPathsObject,
    type ZodOpenApiResponseObject,
} from "zod-openapi";
import type { ApiDocument, ApiDocumentJson } from "@/packages/infrastructure/http/docs/api-document";
import type { HttpRouteCatalog } from "@/packages/infrastructure/http/docs/http-route.catalog";
import type { HttpResponseDoc, HttpRoute, HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpMethod } from "@/packages/infrastructure/http/http-method";
import { ValidatorZodAdapter } from "../validation/validator.zod-adapter";
import { httpErrorBodySchema } from "./http-error-body.schema";

const OPENAPI_VERSION = "3.1.0";
const PATH_PARAM = /:(\w+)/g;
const PARAM_PREFIX = ":";
const PARAM_PREFIX_LENGTH = PARAM_PREFIX.length;
const PATH_SEPARATOR = "/";
const WORD_SEPARATOR = "-";
const SAME_ORIGIN = { url: "/" };
const FIRST_ERROR_STATUS = 400;
const BEFORE = -1;
const AFTER = 1;
const METHOD_ORDER: string[] = Object.values(HttpMethod);

type ApiInfo = { title: string; version: string; description: string };
type DocumentedRoute = HttpRoute & { doc: HttpRouteDoc };

export class ApiDocumentZodOpenApiAdapter implements ApiDocument {
    private document?: ApiDocumentJson;

    constructor(
        private readonly catalog: HttpRouteCatalog,
        private readonly info: ApiInfo,
    ) {}

    toJson(): ApiDocumentJson {
        this.document ??= { ...createDocument(this.createObject(this.documentedRoutes())) };
        return this.document;
    }

    private createObject(routes: DocumentedRoute[]): ZodOpenApiObject {
        const tags = [...new Set(routes.flatMap(({ doc }) => doc.tags))].map((name) => ({ name }));
        const paths = routes.reduce((all, route) => this.addRoute(all, route), {} as ZodOpenApiPathsObject);
        return { openapi: OPENAPI_VERSION, info: this.info, servers: [SAME_ORIGIN], tags, paths };
    }

    private documentedRoutes(): DocumentedRoute[] {
        return this.catalog
            .routes()
            .filter((route): route is DocumentedRoute => route.doc !== undefined)
            .toSorted((first, second) => this.compareRoutes(first, second));
    }

    private compareRoutes(first: HttpRoute, second: HttpRoute): number {
        if (first.path !== second.path) return first.path < second.path ? BEFORE : AFTER;
        return METHOD_ORDER.indexOf(first.method) - METHOD_ORDER.indexOf(second.method);
    }

    private addRoute(paths: ZodOpenApiPathsObject, route: DocumentedRoute): ZodOpenApiPathsObject {
        const path = route.path.replace(PATH_PARAM, (_match, name: string) => `{${name}}`);
        return { ...paths, [path]: { ...paths[path], [route.method]: this.createOperation(route) } };
    }

    private createOperation({ doc, input, path, method }: DocumentedRoute): ZodOpenApiOperationObject {
        const shape = this.readShape(input);
        const params = this.readParamNames(path);
        const body = Object.entries(shape).filter(([name]) => !params.includes(name));
        const { summary, description, tags } = doc;
        return {
            operationId: this.createOperationId(method, path),
            summary,
            description,
            tags,
            requestParams: { path: z.object(Object.fromEntries(params.map((name) => [name, shape[name]]))) },
            ...(body.length > 0 && {
                requestBody: {
                    description: summary,
                    content: { "application/json": { schema: z.object(Object.fromEntries(body)) } },
                },
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

    private createOperationId(method: string, path: string): string {
        const words = path
            .split(PATH_SEPARATOR)
            .filter((segment) => segment && !segment.startsWith(PARAM_PREFIX))
            .flatMap((segment) => segment.split(WORD_SEPARATOR));
        return [method, ...words.map((word) => word.charAt(0).toUpperCase() + word.slice(1))].join("");
    }

    private readParamNames(path: string): string[] {
        return [...path.matchAll(PATH_PARAM)].map(([match]) => match.slice(PARAM_PREFIX_LENGTH));
    }
}
