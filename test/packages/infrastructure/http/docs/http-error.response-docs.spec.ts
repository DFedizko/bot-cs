import { HttpErrorResponseDocs } from "@/packages/infrastructure/http/docs/http-error.response-docs";
import { httpErrorBodySchema } from "@/packages/external/openapi/http-error-body.schema";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";

const NOT_FOUND = { summary: "Foo not found", value: { code: "FOO_NOT_FOUND", message: "No foo 7" } };
const INVALID_FIELD = { path: "fooId", message: "Invalid input: expected string, received undefined" };
const VALIDATION = {
    summary: "Missing foo id",
    value: { code: "VALIDATION_ERROR", message: "Invalid input: fooId", fields: [INVALID_FIELD] },
};

describe("HttpErrorResponseDocs", () => {
    it("Should accept the body of every documented error", () => {
        const examples = Object.values(HttpErrorResponseDocs.badRequest(VALIDATION).examples ?? {});

        expect(examples.every(({ value }) => httpErrorBodySchema.safeParse(value).success)).toBe(true);
    });

    it("Should document a bad request with the validation and malformed body examples", () => {
        const response = HttpErrorResponseDocs.badRequest(VALIDATION);

        expect(Object.keys(response.examples ?? {})).toEqual(["validationError", "malformedBody"]);
    });

    it("Should document a bad query with only its validation examples", () => {
        const response = HttpErrorResponseDocs.badQuery(VALIDATION);

        expect([response.status, Object.keys(response.examples ?? {})]).toEqual([
            HttpStatus.BAD_REQUEST,
            ["validationError"],
        ]);
    });

    it.each([
        ["badRequest", HttpStatus.BAD_REQUEST],
        ["notFound", HttpStatus.NOT_FOUND],
        ["conflict", HttpStatus.CONFLICT],
        ["unprocessable", HttpStatus.UNPROCESSABLE_ENTITY],
        ["serviceUnavailable", HttpStatus.SERVICE_UNAVAILABLE],
    ] as const)("Should document %s with its status", (name, status) => {
        const response = HttpErrorResponseDocs[name](NOT_FOUND);

        expect(response.status).toBe(status);
    });

    it("Should name every example after its error code", () => {
        const response = HttpErrorResponseDocs.unprocessable(NOT_FOUND, VALIDATION);

        expect(Object.keys(response.examples ?? {})).toEqual(["fooNotFound", "validationError"]);
    });

    it("Should keep every example that shares an error code", () => {
        const response = HttpErrorResponseDocs.unprocessable(NOT_FOUND, NOT_FOUND);

        expect(Object.keys(response.examples ?? {})).toEqual(["fooNotFound", "fooNotFound2"]);
    });

    it("Should keep every example whose code ends with a digit", () => {
        const http2 = { summary: "Http 2", value: { code: "HTTP_2", message: "Http 2 only" } };

        const response = HttpErrorResponseDocs.unprocessable(http2, http2, http2);

        expect(Object.keys(response.examples ?? {})).toEqual(["http2", "http22", "http23"]);
    });

    it("Should document the internal server error", () => {
        const response = HttpErrorResponseDocs.internalError();

        expect(response.examples?.internalServerError?.value).toEqual({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
        });
    });
});
