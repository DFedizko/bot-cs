import type { HttpMethod } from "../http-method";
import type { HttpStatus } from "../http-status";

export type HttpExampleDoc = {
    summary: string;
    value: unknown;
};

export type HttpResponseDoc<TSchema> = {
    status: HttpStatus;
    description: string;
    body?: TSchema;
    examples?: Record<string, HttpExampleDoc>;
};

export type HttpRouteDoc<TSchema> = {
    method: HttpMethod;
    path: string;
    summary: string;
    description: string;
    tags: string[];
    input: TSchema;
    responses: HttpResponseDoc<TSchema>[];
};
