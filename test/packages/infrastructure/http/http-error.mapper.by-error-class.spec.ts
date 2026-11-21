import { HttpErrorMapperByErrorClass } from "@/packages/infrastructure/http/http-error.mapper.by-error-class";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";
import { HttpError } from "@/packages/infrastructure/http/errors/http.error";
import { ValidationError } from "@/packages/infrastructure/validation/validation.error";
import { EmptyStringError } from "@/packages/error/empty-string.error";
import { FooInternalError, FooNotFoundError, SpecialFooNotFoundError } from "./__stubs__/foo.errors";

const INTERNAL_SERVER_ERROR_BODY = { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" };
const FOO_NOT_FOUND_BODY = { code: "FOO_NOT_FOUND", message: "Foo not found" };

describe("HttpErrorMapperByErrorClass", () => {
    describe("Http errors", () => {
        it("Should map an http error to its own status and body", () => {
            const mapper = new HttpErrorMapperByErrorClass();

            const response = mapper.map(new NotFoundError("Foo not found"));

            expect(response).toEqual({
                status: HttpStatus.NOT_FOUND,
                body: { code: "NOT_FOUND", message: "Foo not found" },
            });
        });

        it("Should map a validation error to bad request with its failing fields", () => {
            const mapper = new HttpErrorMapperByErrorClass();
            const fields = [{ path: "foo", message: "Expected string" }];

            const response = mapper.map(new ValidationError(fields));

            expect(response).toEqual({
                status: HttpStatus.BAD_REQUEST,
                body: { code: "VALIDATION_ERROR", message: "Invalid input: foo", fields },
            });
        });

        it("Should map a custom http error to the status it carries", () => {
            const mapper = new HttpErrorMapperByErrorClass();

            const response = mapper.map(new HttpError({ status: HttpStatus.CREATED, code: "FOO", message: "Foo" }));

            expect(response).toEqual({ status: HttpStatus.CREATED, body: { code: "FOO", message: "Foo" } });
        });
    });

    describe("Domain errors", () => {
        it("Should map a domain error to unprocessable entity with its code and message", () => {
            const mapper = new HttpErrorMapperByErrorClass();

            const response = mapper.map(new EmptyStringError());

            expect(response).toEqual({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                body: { code: "EMPTY_STRING", message: "The value provided must not be empty" },
            });
        });
    });

    describe("Other errors", () => {
        it("Should map another base error to internal server error with its code only", () => {
            const mapper = new HttpErrorMapperByErrorClass();

            const response = mapper.map(new FooInternalError());

            expect(response).toEqual({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                body: { code: "FOO_INTERNAL", message: INTERNAL_SERVER_ERROR_BODY.message },
            });
        });

        it("Should map an unknown error to internal server error without its message", () => {
            const mapper = new HttpErrorMapperByErrorClass();

            const response = mapper.map(new TypeError("Cannot read properties of undefined"));

            expect(response).toEqual({ status: HttpStatus.INTERNAL_SERVER_ERROR, body: INTERNAL_SERVER_ERROR_BODY });
        });

        it("Should map a thrown value that is not an error to internal server error", () => {
            const mapper = new HttpErrorMapperByErrorClass();

            const response = mapper.map("boom");

            expect(response).toEqual({ status: HttpStatus.INTERNAL_SERVER_ERROR, body: INTERNAL_SERVER_ERROR_BODY });
        });
    });

    describe("Registered mappings", () => {
        it("Should map a registered error class to its registered status", () => {
            const mapper = new HttpErrorMapperByErrorClass([{ error: FooNotFoundError, status: HttpStatus.NOT_FOUND }]);

            const response = mapper.map(new FooNotFoundError());

            expect(response).toEqual({ status: HttpStatus.NOT_FOUND, body: FOO_NOT_FOUND_BODY });
        });

        it("Should map a subclass of a registered error class to the registered status", () => {
            const mapper = new HttpErrorMapperByErrorClass([{ error: FooNotFoundError, status: HttpStatus.NOT_FOUND }]);

            const response = mapper.map(new SpecialFooNotFoundError());

            expect(response).toEqual({ status: HttpStatus.NOT_FOUND, body: FOO_NOT_FOUND_BODY });
        });

        it("Should prefer the mapping of the closest registered class", () => {
            const mapper = new HttpErrorMapperByErrorClass([
                { error: FooNotFoundError, status: HttpStatus.NOT_FOUND },
                { error: SpecialFooNotFoundError, status: HttpStatus.CREATED },
            ]);

            const response = mapper.map(new SpecialFooNotFoundError());

            expect(response.status).toBe(HttpStatus.CREATED);
        });

        it("Should expose the message of a registered base error", () => {
            const mapper = new HttpErrorMapperByErrorClass([{ error: FooInternalError, status: HttpStatus.NOT_FOUND }]);

            const response = mapper.map(new FooInternalError());

            expect(response).toEqual({
                status: HttpStatus.NOT_FOUND,
                body: { code: "FOO_INTERNAL", message: "Foo database password leaked" },
            });
        });

        it("Should leave unregistered errors on their default mapping", () => {
            const mapper = new HttpErrorMapperByErrorClass([{ error: FooNotFoundError, status: HttpStatus.NOT_FOUND }]);

            const response = mapper.map(new EmptyStringError());

            expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
        });
    });
});
