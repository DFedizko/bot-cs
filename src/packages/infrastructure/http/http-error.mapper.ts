import type { HttpResponse } from "./http-server";
import type { HttpStatus } from "./http-status";

export type ErrorClass = abstract new (...args: never[]) => Error;

export type HttpErrorMapping = {
    error: ErrorClass;
    status: HttpStatus;
};

export type HttpErrorBody = {
    code: string;
    message: string;
};

export interface HttpErrorMapper {
    map(error: unknown): HttpResponse;
}
