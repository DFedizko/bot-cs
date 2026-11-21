import { ApiDocumentZodOpenApiAdapter } from "@/packages/external/openapi/api-document.zod-openapi-adapter";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import {
    FOO_ID,
    addFooDoc,
    addFooRoute,
    fooCatalog,
    fooConflict,
    removeFooRoute,
    undocumentedRoute,
} from "./__stubs__/foo.route-doc";

type Content = Record<
    string,
    { schema: { properties?: object; required?: string[]; $ref?: string }; examples?: unknown }
>;
type Operation = {
    summary: string;
    description: string;
    tags: string[];
    parameters: { name: string; schema: { examples: unknown[] } }[];
    requestBody?: { content: Content };
    responses: Record<string, { description: string; content?: Content }>;
};
type Json = { openapi: string; info: unknown; paths: Record<string, Record<string, Operation>> };

const INFO = { title: "Foo API", version: "1.0.0", description: "Manages foos" };
const FOO_PATH = "/foos/{fooId}";
const JSON_TYPE = "application/json";

const document = (): Json =>
    new ApiDocumentZodOpenApiAdapter(
        fooCatalog([addFooRoute, removeFooRoute, undocumentedRoute]),
        INFO,
    ).toJson() as Json;
const addFoo = (): Operation => document().paths[FOO_PATH]!.post!;
const removeFoo = (): Operation => document().paths[FOO_PATH]!.delete!;

describe("ApiDocumentZodOpenApiAdapter", () => {
    it("Should describe the api as OpenAPI 3.1", () => {
        const { openapi, info } = document();

        expect({ openapi, info }).toEqual({ openapi: "3.1.0", info: INFO });
    });

    it("Should document only the routes with a doc, the OpenAPI way", () => {
        const paths = Object.keys(document().paths);

        expect(paths).toEqual([FOO_PATH]);
    });

    it("Should document every route of a path", () => {
        const methods = Object.keys(document().paths[FOO_PATH]!);

        expect(methods).toEqual(["post", "delete"]);
    });

    it("Should document the summary, description and tags of the route", () => {
        const { summary, description, tags } = addFoo();

        expect({ summary, description, tags }).toEqual({
            summary: addFooDoc.summary,
            description: addFooDoc.description,
            tags: addFooDoc.tags,
        });
    });

    it("Should document the path params from the input schema", () => {
        const [param] = addFoo().parameters;

        expect(param).toMatchObject({ name: "fooId", in: "path", required: true, description: "The id of the foo" });
    });

    it("Should give the path params their example", () => {
        const [param] = addFoo().parameters;

        expect(param?.schema.examples).toEqual([FOO_ID]);
    });

    it("Should document the body without the path params", () => {
        const schema = addFoo().requestBody!.content[JSON_TYPE]!.schema;

        expect(Object.keys(schema.properties ?? {})).toEqual(["name", "size"]);
    });

    it("Should document the required body fields", () => {
        const schema = addFoo().requestBody!.content[JSON_TYPE]!.schema;

        expect(schema.required).toEqual(["name"]);
    });

    it("Should leave out the body of a route that takes only path params", () => {
        const { requestBody } = removeFoo();

        expect(requestBody).toBeUndefined();
    });

    it("Should document a success without body", () => {
        const response = removeFoo().responses[HttpStatus.OK];

        expect(response).toEqual({ description: "The foo was removed" });
    });

    it("Should document an error with the error body and its examples", () => {
        const content = addFoo().responses[HttpStatus.CONFLICT]!.content![JSON_TYPE]!;

        expect(content.examples).toEqual({
            fooAlreadyExists: { summary: "Foo already exists", value: fooConflict },
        });
    });

    it("Should share the error body schema between errors", () => {
        const content = addFoo().responses[HttpStatus.CONFLICT]!.content![JSON_TYPE]!;

        expect(content.schema).toEqual({ $ref: "#/components/schemas/HttpErrorBody" });
    });

    it("Should build the document once", () => {
        const adapter = new ApiDocumentZodOpenApiAdapter(fooCatalog([addFooRoute]), INFO);

        const json = adapter.toJson();

        expect(adapter.toJson()).toBe(json);
    });
});
