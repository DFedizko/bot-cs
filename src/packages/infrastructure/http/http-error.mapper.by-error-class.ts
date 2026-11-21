import { BaseError } from "@/packages/building-blocks/base-error";
import { DomainError } from "@/packages/error/domain-error";
import { HttpError } from "./errors/http.error";
import type { ErrorClass, HttpErrorBody, HttpErrorMapper, HttpErrorMapping } from "./http-error.mapper";
import type { HttpResponse } from "./http-server";
import { HttpStatus } from "./http-status";
import { ValidationError } from "../validation/validation.error";

const INTERNAL_ERROR_CODE = "INTERNAL_SERVER_ERROR";
const INTERNAL_ERROR_MESSAGE = "Internal server error";

export class HttpErrorMapperByErrorClass implements HttpErrorMapper {
    private readonly statuses: ReadonlyMap<ErrorClass, HttpStatus>;

    constructor(mappings: HttpErrorMapping[] = []) {
        this.statuses = new Map(mappings.map(({ error, status }) => [error, status]));
    }

    map(error: unknown): HttpResponse {
        if (!(error instanceof Error)) return this.mapToInternalError();
        const registeredStatus = this.findRegisteredStatus(Object.getPrototypeOf(error));
        if (registeredStatus) return this.mapToExposedError(error, registeredStatus);
        if (error instanceof ValidationError) return this.mapToValidationError(error);
        if (error instanceof HttpError) return this.mapToExposedError(error, error.httpStatus);
        if (error instanceof DomainError) return this.mapToExposedError(error, HttpStatus.UNPROCESSABLE_ENTITY);
        return this.mapToInternalError(error);
    }

    private findRegisteredStatus(prototype: object | null): HttpStatus | undefined {
        if (!prototype) return undefined;
        const status = this.statuses.get(prototype.constructor as ErrorClass);
        return status ?? this.findRegisteredStatus(Object.getPrototypeOf(prototype));
    }

    private mapToExposedError(error: Error, status: HttpStatus): HttpResponse {
        return { status, body: this.buildBody(this.readCode(error), error.message) };
    }

    private mapToValidationError(error: ValidationError): HttpResponse {
        const body = { ...this.buildBody(this.readCode(error), error.message), fields: error.fields };
        return { status: HttpStatus.BAD_REQUEST, body };
    }

    private mapToInternalError(error?: Error): HttpResponse {
        const code = error ? this.readCode(error) : INTERNAL_ERROR_CODE;
        return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: this.buildBody(code, INTERNAL_ERROR_MESSAGE) };
    }

    private readCode(error: Error): string {
        return (error instanceof BaseError && error.code) || INTERNAL_ERROR_CODE;
    }

    private buildBody(code: string, message: string): HttpErrorBody {
        return { code, message };
    }
}
