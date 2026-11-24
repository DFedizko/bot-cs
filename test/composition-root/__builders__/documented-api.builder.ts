import type { Container } from "inversify";
import {
    COMMAND_BUS,
    HTTP_CONTROLLER,
    HTTP_ROUTE_CATALOG,
    HTTP_SERVER,
    LOGGER,
} from "@/packages/external/di/packages.identifiers";
import { freePort } from "@/packages/external/http/__builders__/free-port.builder";
import { ApiDocumentHttpController } from "@/packages/infrastructure/http/docs/api-document.http-controller";
import { ApiReferenceHttpController } from "@/packages/infrastructure/http/docs/api-reference.http-controller";

type JsonSchema = { properties?: Record<string, unknown>; required?: string[] };
type OpenApiParameter = {
    name: string;
    in: string;
    required?: boolean;
    description?: string;
    schema: { examples?: unknown[] };
};
type OpenApiOperation = {
    parameters: OpenApiParameter[];
    requestBody?: { content: Record<string, { schema: JsonSchema; example?: unknown }> };
    responses: Record<string, unknown>;
};
type OpenApiDocument = { paths: Record<string, Record<string, OpenApiOperation>> };

const DOCS_PATHS = [ApiDocumentHttpController.PATH, ApiReferenceHttpController.PATH];
const JSON_TYPE = "application/json";
const PATH_PARAM = /:(\w+)/g;
const READ_METHOD = "get";
const QUERY = "query";

export type Route = { method: string; path: string };
export type DocumentedRoute = Route & { operation: OpenApiOperation };
export type ApiAnswer = { status: number; fields: string[] };

export type DocumentedApi = {
    served: Route[];
    documented: DocumentedRoute[];
    send(route: DocumentedRoute, body?: Record<string, unknown>): Promise<ApiAnswer>;
};

export const toOpenApiPath = (path: string): string => path.replace(PATH_PARAM, (_match, name) => `{${name}}`);

const readsOnly = (route: Route): boolean => route.method === READ_METHOD;

const queryParams = (route: DocumentedRoute): OpenApiParameter[] =>
    route.operation.parameters.filter((param) => param.in === QUERY);

const queryExample = (route: DocumentedRoute): Record<string, unknown> =>
    Object.fromEntries(
        queryParams(route)
            .map(({ name, schema }) => [name, schema.examples?.[0]])
            .filter(([, example]) => example !== undefined),
    );

export const exampleBody = (route: DocumentedRoute): Record<string, unknown> | undefined =>
    readsOnly(route) ? queryExample(route) : exampleOf(route.operation.requestBody?.content[JSON_TYPE]?.schema);

const exampleOf = (schema?: JsonSchema): Record<string, unknown> | undefined => {
    if (!schema) return undefined;
    const fields = Object.entries(schema.properties ?? {}).map(([name, field]) => [
        name,
        (field as { examples?: unknown[] }).examples?.[0],
    ]);
    return Object.fromEntries(fields.filter(([, example]) => example !== undefined));
};

const queryFields = (route: DocumentedRoute): { names: string[]; required: string[] } => ({
    names: queryParams(route).map(({ name }) => name),
    required: queryParams(route)
        .filter(({ required }) => required)
        .map(({ name }) => name),
});

export const bodyFields = (route: DocumentedRoute): { names: string[]; required: string[] } => {
    if (readsOnly(route)) return queryFields(route);
    const schema = route.operation.requestBody?.content[JSON_TYPE]?.schema;
    return { names: Object.keys(schema?.properties ?? {}), required: schema?.required ?? [] };
};

const listOperations = (document: OpenApiDocument): DocumentedRoute[] =>
    Object.entries(document.paths).flatMap(([path, item]) =>
        Object.entries(item).map(([method, operation]) => ({ method, path, operation })),
    );

const fillPath = (route: DocumentedRoute): string =>
    route.operation.parameters.reduce(
        (path, { name, schema }) => path.replace(`{${name}}`, encodeURIComponent(String(schema.examples?.[0]))),
        route.path,
    );

const toQueryString = (fields: Record<string, unknown> = {}): string => {
    const query = new URLSearchParams(
        Object.entries(fields).map(([name, value]): [string, string] => [name, String(value)]),
    );
    return query.size ? `?${query}` : "";
};

const readFields = async (response: Response): Promise<string[]> => {
    const text = await response.text();
    const fields = text ? (JSON.parse(text).fields ?? []) : [];
    return fields.map(({ path }: { path: string }) => path);
};

const answerOf = async (response: Response): Promise<ApiAnswer> => ({
    status: response.status,
    fields: await readFields(response),
});

export const startDocumentedApi = async (container: Container): Promise<DocumentedApi> => {
    jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockResolvedValue();
    await container.getAllAsync(HTTP_CONTROLLER);
    const routes = container.get(HTTP_ROUTE_CATALOG).routes();
    const port = freePort();
    container.get(HTTP_SERVER).listen(port);
    const url = `http://localhost:${port}`;
    const document = (await (await fetch(`${url}${ApiDocumentHttpController.PATH}`)).json()) as OpenApiDocument;
    return {
        served: routes.filter(({ path }) => !DOCS_PATHS.includes(path)).map(({ method, path }) => ({ method, path })),
        documented: listOperations(document),
        send: async (route, body) => {
            if (readsOnly(route)) return answerOf(await fetch(`${url}${fillPath(route)}${toQueryString(body)}`));
            const init = body && { headers: { "content-type": JSON_TYPE }, body: JSON.stringify(body) };
            return answerOf(await fetch(`${url}${fillPath(route)}`, { method: route.method, ...init }));
        },
    };
};
