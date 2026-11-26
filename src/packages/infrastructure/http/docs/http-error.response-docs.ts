import type { HttpExampleDoc, HttpResponseDoc } from "./http-route.doc";
import type { HttpErrorBody } from "../http-error.mapper";
import { HttpStatus } from "../http-status";

type ErrorResponseDoc = HttpResponseDoc;
type ErrorExample = HttpExampleDoc & { value: HttpErrorBody };

const WORD_SEPARATOR = "_";

const MALFORMED_BODY: ErrorExample = {
    summary: "The body is not valid JSON",
    value: { code: "MALFORMED_BODY", message: "The request body is not valid JSON" },
};

const INTERNAL_ERROR: ErrorExample = {
    summary: "An unexpected failure",
    value: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" },
};

export class HttpErrorResponseDocs {
    static badRequest(...validations: ErrorExample[]): ErrorResponseDoc {
        const description = "The input is invalid: the fields name each failing field, or the body is not JSON";
        return HttpErrorResponseDocs.create(HttpStatus.BAD_REQUEST, description, [...validations, MALFORMED_BODY]);
    }

    static badQuery(...validations: ErrorExample[]): ErrorResponseDoc {
        const description = "The path or query params are invalid: the fields name each failing one";
        return HttpErrorResponseDocs.create(HttpStatus.BAD_REQUEST, description, validations);
    }

    static notFound(...examples: ErrorExample[]): ErrorResponseDoc {
        return HttpErrorResponseDocs.create(HttpStatus.NOT_FOUND, "The resource doesn't exist", examples);
    }

    static conflict(...examples: ErrorExample[]): ErrorResponseDoc {
        return HttpErrorResponseDocs.create(HttpStatus.CONFLICT, "The resource already exists", examples);
    }

    static unprocessable(...examples: ErrorExample[]): ErrorResponseDoc {
        const description = "The input is well formed but breaks a domain rule";
        return HttpErrorResponseDocs.create(HttpStatus.UNPROCESSABLE_ENTITY, description, examples);
    }

    static serviceUnavailable(...examples: ErrorExample[]): ErrorResponseDoc {
        const description = "A resource the route needs is not ready yet; try again later";
        return HttpErrorResponseDocs.create(HttpStatus.SERVICE_UNAVAILABLE, description, examples);
    }

    static internalError(): ErrorResponseDoc {
        const description = "An unexpected failure; the details are only logged";
        return HttpErrorResponseDocs.create(HttpStatus.INTERNAL_SERVER_ERROR, description, [INTERNAL_ERROR]);
    }

    private static create(status: HttpStatus, description: string, examples: ErrorExample[]): ErrorResponseDoc {
        const names = examples.map((example) => this.nameOf(example));
        const named = examples.map((example, index) => [this.numberName(names, index), example]);
        return { status, description, examples: Object.fromEntries(named) };
    }

    private static numberName(names: string[], index: number): string {
        const name = names[index] ?? "";
        const earlier = names.slice(0, index).filter((other) => other === name).length;
        return earlier ? `${name}${earlier + 1}` : name;
    }

    private static nameOf({ value }: ErrorExample): string {
        const [first = "", ...rest] = value.code.toLowerCase().split(WORD_SEPARATOR);
        return [first, ...rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1))].join("");
    }
}
