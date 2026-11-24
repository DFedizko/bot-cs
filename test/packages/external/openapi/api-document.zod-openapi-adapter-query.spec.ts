import { ApiDocumentZodOpenApiAdapter } from "@/packages/external/openapi/api-document.zod-openapi-adapter";
import { FOO_FOUND, fooCatalog, searchFoosRoute } from "./__stubs__/foo.route-doc";

type Parameter = { name: string; in: string; required?: boolean };
type Operation = {
    parameters: Parameter[];
    requestBody?: unknown;
    responses: Record<string, { content?: Record<string, { examples?: unknown }> }>;
};
type Json = { paths: Record<string, Record<string, Operation>> };

const INFO = { title: "Foo API", version: "1.0.0", description: "Manages foos" };
const SEARCH_PATH = "/owners/{ownerId}/foos";
const JSON_TYPE = "application/json";

const searchFoos = (): Operation =>
    (new ApiDocumentZodOpenApiAdapter(fooCatalog([searchFoosRoute]), INFO).toJson() as Json).paths[SEARCH_PATH]!.get!;

describe("ApiDocumentZodOpenApiAdapter for a route that reads", () => {
    it("Should document the path params in the path and the other fields in the query", () => {
        const { parameters } = searchFoos();

        expect(parameters.map(({ name, in: location }) => `${location}:${name}`)).toEqual([
            "path:ownerId",
            "query:name",
            "query:page",
        ]);
    });

    it("Should document the query fields as optional when the schema says so", () => {
        const { parameters } = searchFoos();

        expect(
            parameters.filter(({ in: location }) => location === "query").map(({ required = false }) => required),
        ).toEqual([false, false]);
    });

    it("Should not document a request body", () => {
        const { requestBody } = searchFoos();

        expect(requestBody).toBeUndefined();
    });

    it("Should document the example of the success response", () => {
        const { responses } = searchFoos();

        expect(responses["200"]?.content?.[JSON_TYPE]?.examples).toEqual({
            fooFound: { summary: "One foo found", value: FOO_FOUND },
        });
    });
});
