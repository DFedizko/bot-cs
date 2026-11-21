import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import {
    bodyFields,
    exampleBody,
    startDocumentedApi,
    toOpenApiPath,
    type DocumentedRoute,
} from "./__builders__/documented-api.builder";

const DOCS_ENV = "development";

const toKey = ({ method, path }: { method: string; path: string }): string => `${method} ${path}`;
const nullFields = (route: DocumentedRoute): Record<string, null> =>
    Object.fromEntries(bodyFields(route).names.map((name) => [name, null]));

let container: Container;

describe("Api documentation", () => {
    beforeEach(() => {
        container = testContainer(DOCS_ENV);
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should serve at least one documented route", async () => {
        const api = await startDocumentedApi(container);

        expect(api.documented.length).toBeGreaterThan(0);
    });

    it("Should document every served route", async () => {
        const api = await startDocumentedApi(container);

        const served = api.served.map(({ method, path }) => toKey({ method, path: toOpenApiPath(path) }));

        expect(api.documented.map(toKey).sort()).toEqual(served.sort());
    });

    it("Should accept the documented example of every route", async () => {
        const api = await startDocumentedApi(container);

        const answers = await Promise.all(api.documented.map((route) => api.send(route, exampleBody(route))));

        expect(answers.filter(({ status }) => status === HttpStatus.BAD_REQUEST)).toEqual([]);
    });

    it("Should require exactly the documented required fields of every route", async () => {
        const api = await startDocumentedApi(container);

        const answers = await Promise.all(api.documented.map((route) => api.send(route, {})));

        expect(answers.map(({ fields }) => fields)).toEqual(api.documented.map((route) => bodyFields(route).required));
    });

    it("Should validate exactly the documented body fields of every route", async () => {
        const api = await startDocumentedApi(container);

        const answers = await Promise.all(api.documented.map((route) => api.send(route, nullFields(route))));

        expect(answers.map(({ fields }) => fields)).toEqual(api.documented.map((route) => bodyFields(route).names));
    });

    it("Should give an example to every path param", async () => {
        const api = await startDocumentedApi(container);

        const params = api.documented.flatMap(({ operation }) => operation.parameters);

        expect(params.filter(({ example }) => example === undefined)).toEqual([]);
    });

    it("Should document a success and the internal error of every route", async () => {
        const api = await startDocumentedApi(container);

        const statuses = api.documented.map(({ operation }) => Object.keys(operation.responses));

        expect(statuses.filter((codes) => !codes.includes("200") || !codes.includes("500"))).toEqual([]);
    });
});
