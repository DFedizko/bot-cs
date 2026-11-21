import type { ApiDocumentJson } from "@/packages/infrastructure/http/docs/api-document";

export type JsonSchema = Record<string, unknown>;

export type OpenApiExample = { summary: string; value: unknown };

export type OpenApiMediaType = {
    schema: JsonSchema;
    example?: unknown;
    examples?: Record<string, OpenApiExample>;
};

export type OpenApiContent = { "application/json": OpenApiMediaType };

export type OpenApiParameter = {
    name: string;
    in: "path";
    required: true;
    description?: string;
    schema: JsonSchema;
    example?: unknown;
};

export type OpenApiResponse = { description: string; content?: OpenApiContent };

export type OpenApiOperation = {
    summary: string;
    description: string;
    tags: string[];
    parameters: OpenApiParameter[];
    requestBody?: { required: true; content: OpenApiContent };
    responses: Record<string, OpenApiResponse>;
};

export type OpenApiInfo = { title: string; version: string; description: string };

export type OpenApiDocument = ApiDocumentJson & {
    openapi: string;
    info: OpenApiInfo;
    paths: Record<string, Record<string, OpenApiOperation>>;
};
