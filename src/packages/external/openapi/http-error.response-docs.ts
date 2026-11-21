import type z from "zod";
import type { HttpExampleDoc, HttpResponseDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import type { HttpErrorBody } from "@/packages/infrastructure/http/http-error.mapper";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { httpErrorBodySchema } from "./http-error-body.schema";

type ErrorResponseDoc = HttpResponseDoc<z.ZodObject>;
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
    static badRequest(validation: ErrorExample): ErrorResponseDoc {
        const description = "The input is invalid: the fields name each failing field, or the body is not JSON";
        return HttpErrorResponseDocs.create(HttpStatus.BAD_REQUEST, description, [validation, MALFORMED_BODY]);
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

    static internalError(): ErrorResponseDoc {
        const description = "An unexpected failure; the details are only logged";
        return HttpErrorResponseDocs.create(HttpStatus.INTERNAL_SERVER_ERROR, description, [INTERNAL_ERROR]);
    }

    private static create(status: HttpStatus, description: string, examples: ErrorExample[]): ErrorResponseDoc {
        const namedExamples = Object.fromEntries(examples.map((example) => [this.nameOf(example), example]));
        return { status, description, body: httpErrorBodySchema, examples: namedExamples };
    }

    private static nameOf({ value }: ErrorExample): string {
        const [first = "", ...rest] = value.code.toLowerCase().split(WORD_SEPARATOR);
        return [first, ...rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1))].join("");
    }
}
