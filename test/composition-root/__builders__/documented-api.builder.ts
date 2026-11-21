import type { Container } from "inversify";
import { COMMAND_BUS, HTTP_CONTROLLER, HTTP_SERVER, LOGGER } from "@/packages/external/di/packages.identifiers";
import { freePort } from "@/packages/external/http/__builders__/free-port.builder";
import { ApiDocumentHttpController } from "@/packages/infrastructure/http/docs/api-document.http-controller";
import { ApiReferenceHttpController } from "@/packages/infrastructure/http/docs/api-reference.http-controller";
import type { OpenApiDocument, OpenApiOperation } from "@/packages/external/openapi/openapi-document";

const HTTP_METHODS = ["get", "post", "patch", "put", "delete"] as const;
const DOCS_PATHS = [ApiDocumentHttpController.PATH, ApiReferenceHttpController.PATH];
const JSON_TYPE = "application/json";
const PATH_PARAM = /:(\w+)/g;

export type Route = { method: string; path: string };
export type DocumentedRoute = Route & { operation: OpenApiOperation };
export type ApiAnswer = { status: number; fields: string[] };

export type DocumentedApi = {
    served: Route[];
    documented: DocumentedRoute[];
    send(route: DocumentedRoute, body?: Record<string, unknown>): Promise<ApiAnswer>;
};

export const toOpenApiPath = (path: string): string => path.replace(PATH_PARAM, (_match, name) => `{${name}}`);

export const exampleBody = (route: DocumentedRoute): Record<string, unknown> | undefined =>
    route.operation.requestBody?.content[JSON_TYPE].example as Record<string, unknown> | undefined;

export const bodyFields = (route: DocumentedRoute): { names: string[]; required: string[] } => {
    const schema = route.operation.requestBody?.content[JSON_TYPE].schema;
    return { names: Object.keys(schema?.properties ?? {}), required: (schema?.required as string[]) ?? [] };
};

const recordRoutes = (container: Container): Route[] => {
    const routes: Route[] = [];
    const httpServer = container.get(HTTP_SERVER);
    HTTP_METHODS.forEach((method) => {
        const register = httpServer[method].bind(httpServer);
        jest.spyOn(httpServer, method).mockImplementation((path, callback) => {
            routes.push({ method, path });
            register(path, callback);
        });
    });
    return routes;
};

const listOperations = (document: OpenApiDocument): DocumentedRoute[] =>
    Object.entries(document.paths).flatMap(([path, item]) =>
        Object.entries(item).map(([method, operation]) => ({ method, path, operation })),
    );

const fillPath = (route: DocumentedRoute): string =>
    route.operation.parameters.reduce(
        (path, { name, example }) => path.replace(`{${name}}`, encodeURIComponent(String(example))),
        route.path,
    );

const readFields = async (response: Response): Promise<string[]> => {
    const text = await response.text();
    const fields = text ? (JSON.parse(text).fields ?? []) : [];
    return fields.map(({ path }: { path: string }) => path);
};

export const startDocumentedApi = async (container: Container): Promise<DocumentedApi> => {
    jest.spyOn(container.get(LOGGER), "log").mockImplementation(() => {});
    jest.spyOn(await container.getAsync(COMMAND_BUS), "dispatch").mockResolvedValue();
    const routes = recordRoutes(container);
    await container.getAllAsync(HTTP_CONTROLLER);
    const port = freePort();
    container.get(HTTP_SERVER).listen(port);
    const url = `http://localhost:${port}`;
    const document = (await (await fetch(`${url}${ApiDocumentHttpController.PATH}`)).json()) as OpenApiDocument;
    return {
        served: routes.filter(({ path }) => !DOCS_PATHS.includes(path)),
        documented: listOperations(document),
        send: async (route, body) => {
            const init = body && { headers: { "content-type": JSON_TYPE }, body: JSON.stringify(body) };
            const response = await fetch(`${url}${fillPath(route)}`, { method: route.method, ...init });
            return { status: response.status, fields: await readFields(response) };
        },
    };
};
