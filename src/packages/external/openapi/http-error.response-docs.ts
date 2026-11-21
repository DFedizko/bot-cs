import type z from "zod";
import type { HttpExampleDoc, HttpResponseDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import type { HttpErrorBody } from "@/packages/infrastructure/http/http-error.mapper";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { httpErrorBodySchema } from "./http-error-body.schema";

type ErrorResponseDoc = HttpResponseDoc<z.ZodObject>;
type ErrorExample = HttpExampleDoc & { value: HttpErrorBody };

type NamedExamples = Record<string, ErrorExample>;

const WORD_SEPARATOR = "_";
const NUMBERED = /\d+$/;

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
        return { status, description, body: httpErrorBodySchema, examples: examples.reduce(this.addExample, {}) };
    }

    private static addExample(named: NamedExamples, example: ErrorExample): NamedExamples {
        const name = HttpErrorResponseDocs.nameOf(example);
        const sameCode = Object.keys(named).filter((key) => key.replace(NUMBERED, "") === name).length;
        return { ...named, [sameCode ? `${name}${sameCode + 1}` : name]: example };
    }

    private static nameOf({ value }: ErrorExample): string {
        const [first = "", ...rest] = value.code.toLowerCase().split(WORD_SEPARATOR);
        return [first, ...rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1))].join("");
    }
}
