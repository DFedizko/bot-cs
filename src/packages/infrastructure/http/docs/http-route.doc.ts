import type { HttpMethod } from "../http-method";
import type { HttpStatus } from "../http-status";
import type { HttpRouteOptions } from "../http-server";

export type HttpExampleDoc = {
    summary: string;
    value: unknown;
};

export type HttpResponseDoc = {
    status: HttpStatus;
    description: string;
    examples?: Record<string, HttpExampleDoc>;
};

export type HttpRouteDoc = {
    summary: string;
    description: string;
    tags: string[];
    responses: HttpResponseDoc[];
};

export type HttpRoute = HttpRouteOptions & {
    method: HttpMethod;
    path: string;
};
