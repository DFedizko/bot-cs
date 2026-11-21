import type z from "zod";
import type { HttpResponseDoc, HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { JsonSchemaZodConverter } from "./json-schema.zod-converter";
import type { OpenApiContent, OpenApiOperation, OpenApiParameter, OpenApiResponse } from "./openapi-document";

const PATH_PARAM = /:(\w+)/g;
const PARAM_PREFIX_LENGTH = 1;
const PATH_LOCATION = "path";

type ZodRoute = HttpRouteDoc<z.ZodObject>;
type Mask = Record<string, true>;

export class OpenApiOperationFactory {
    static create(route: ZodRoute): OpenApiOperation {
        const { summary, description, tags } = route;
        const operation = { summary, description, tags, parameters: OpenApiOperationFactory.createParams(route) };
        const responses = Object.fromEntries(route.responses.map(OpenApiOperationFactory.createResponse));
        const requestBody = OpenApiOperationFactory.createBody(route);
        return requestBody ? { ...operation, requestBody, responses } : { ...operation, responses };
    }

    static toOpenApiPath(path: string): string {
        return path.replace(PATH_PARAM, (_match, name: string) => `{${name}}`);
    }

    private static readParamNames(path: string): string[] {
        return [...path.matchAll(PATH_PARAM)].map(([match]) => match.slice(PARAM_PREFIX_LENGTH));
    }

    private static createParams(route: ZodRoute): OpenApiParameter[] {
        return OpenApiOperationFactory.readParamNames(route.path).map((name) =>
            OpenApiOperationFactory.createParam(name, route.input.shape[name]),
        );
    }

    private static createParam(name: string, schema: z.ZodType): OpenApiParameter {
        const jsonSchema = JsonSchemaZodConverter.convert(schema);
        const { description, examples } = jsonSchema;
        const param = { name, in: PATH_LOCATION, required: true, schema: jsonSchema } as const;
        return { ...param, ...(description && { description }), ...(examples && { example: examples[0] }) };
    }

    private static createBody(route: ZodRoute): OpenApiOperation["requestBody"] {
        const mask = OpenApiOperationFactory.toMask(OpenApiOperationFactory.readParamNames(route.path));
        const body = route.input.omit(mask);
        if (Object.keys(body.shape).length === 0) return undefined;
        const example = OpenApiOperationFactory.createExample(body);
        const schema = JsonSchemaZodConverter.convert(body);
        return { required: true, content: { "application/json": { schema, example } } };
    }

    private static createExample(body: z.ZodObject): Record<string, unknown> {
        const fields = Object.entries(body.shape).map(([name, field]) => [
            name,
            JsonSchemaZodConverter.exampleOf(field),
        ]);
        return Object.fromEntries(fields.filter(([, example]) => example !== undefined));
    }

    private static createResponse(response: HttpResponseDoc<z.ZodObject>): [string, OpenApiResponse] {
        const { status, description, body, examples } = response;
        if (!body) return [String(status), { description }];
        const content: OpenApiContent = {
            "application/json": { schema: JsonSchemaZodConverter.convert(body), ...(examples && { examples }) },
        };
        return [String(status), { description, content }];
    }

    private static toMask(names: string[]): Mask {
        return Object.fromEntries(names.map((name) => [name, true]));
    }
}
