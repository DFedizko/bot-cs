import { ApiDocumentZodAdapter } from "@/packages/external/openapi/api-document.zod-adapter";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { FOO_ID, FOO_NAME, FOO_SIZE, addFooRoute, fooConflict, removeFooRoute } from "./__stubs__/foo.route-doc";

const INFO = { title: "Foo API", version: "1.0.0", description: "Manages foos" };
const FOO_PATH = "/foos/{fooId}";
const JSON_TYPE = "application/json";

const document = () => new ApiDocumentZodAdapter([addFooRoute, removeFooRoute], INFO).build();
const addFoo = () => document().paths[FOO_PATH]!.post!;
const removeFoo = () => document().paths[FOO_PATH]!.delete!;

describe("ApiDocumentZodAdapter", () => {
    it("Should describe the api as OpenAPI 3.1", () => {
        const { openapi, info } = document();

        expect({ openapi, info }).toEqual({ openapi: "3.1.0", info: INFO });
    });

    it("Should write the path params the OpenAPI way", () => {
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
            summary: addFooRoute.summary,
            description: addFooRoute.description,
            tags: addFooRoute.tags,
        });
    });

    it("Should document the path params with their schema and example", () => {
        const { parameters } = addFoo();

        expect(parameters).toEqual([
            {
                name: "fooId",
                in: "path",
                required: true,
                description: "The id of the foo",
                schema: { type: "string", description: "The id of the foo", examples: [FOO_ID] },
                example: FOO_ID,
            },
        ]);
    });

    it("Should document the body without the path params", () => {
        const schema = addFoo().requestBody!.content[JSON_TYPE].schema;

        expect(schema).toMatchObject({ type: "object", required: ["name"] });
        expect(Object.keys(schema.properties as object)).toEqual(["name", "size"]);
    });

    it("Should leave the json schema dialect to the document", () => {
        const schema = addFoo().requestBody!.content[JSON_TYPE].schema;

        expect(schema.$schema).toBeUndefined();
    });

    it("Should pre-fill the body with the examples of its fields", () => {
        const { example } = addFoo().requestBody!.content[JSON_TYPE];

        expect(example).toEqual({ name: FOO_NAME, size: FOO_SIZE });
    });

    it("Should leave out the body of a route that takes only path params", () => {
        const { requestBody } = removeFoo();

        expect(requestBody).toBeUndefined();
    });

    it("Should document a response without body", () => {
        const response = removeFoo().responses[HttpStatus.OK];

        expect(response).toEqual({ description: "The foo was removed" });
    });

    it("Should document a response body with its examples", () => {
        const content = addFoo().responses[HttpStatus.CONFLICT]!.content![JSON_TYPE];

        expect(content).toEqual({
            schema: {
                type: "object",
                properties: { code: { type: "string" }, message: { type: "string" } },
                required: ["code", "message"],
            },
            examples: { fooAlreadyExists: { summary: "Foo already exists", value: fooConflict } },
        });
    });

    it("Should answer the document as json", () => {
        const adapter = new ApiDocumentZodAdapter([addFooRoute], INFO);

        const json = adapter.toJson();

        expect(json).toEqual(adapter.build());
    });
});
