import type { HttpRequest } from "@/packages/infrastructure/http/http-server";
import { HttpRequestInput } from "@/packages/infrastructure/http/http-request-input";
import { ValidationError } from "@/packages/infrastructure/validation/validation.error";

const fooRequest = (params: Record<string, string>, body: unknown, searchParams = {}): HttpRequest => ({
    params,
    searchParams,
    headers: {},
    cookies: {},
    body,
});

describe("HttpRequestInput", () => {
    it("Should merge the path params and the body", () => {
        const input = HttpRequestInput.from(fooRequest({ id: "1" }, { name: "Foo" }));

        expect(input).toEqual({ id: "1", name: "Foo" });
    });

    it("Should keep the path params over the body keys with the same name", () => {
        const input = HttpRequestInput.from(fooRequest({ id: "1" }, { id: "2" }));

        expect(input).toEqual({ id: "1" });
    });

    it("Should read a request without body as its path params", () => {
        const input = HttpRequestInput.from(fooRequest({ id: "1" }, undefined));

        expect(input).toEqual({ id: "1" });
    });

    it("Should leave the search params out of the input of a route with a body", () => {
        const input = HttpRequestInput.from(fooRequest({ id: "1" }, { name: "Foo" }, { page: "2" }));

        expect(input).toEqual({ id: "1", name: "Foo" });
    });

    it("Should merge the search params and the path params of a route that reads", () => {
        const input = HttpRequestInput.fromQuery(fooRequest({ id: "1" }, undefined, { page: "2" }));

        expect(input).toEqual({ id: "1", page: "2" });
    });

    it("Should keep the path params over the search params with the same name", () => {
        const input = HttpRequestInput.fromQuery(fooRequest({ id: "1" }, undefined, { id: "2" }));

        expect(input).toEqual({ id: "1" });
    });

    it("Should leave the body out of the input of a route that reads", () => {
        const input = HttpRequestInput.fromQuery(fooRequest({ id: "1" }, { name: "Foo" }, { page: "2" }));

        expect(input).toEqual({ id: "1", page: "2" });
    });

    it.each([["a text"], [["a", "list"]], [null]])("Should reject the body %p that is not an object", (body) => {
        const read = () => HttpRequestInput.from(fooRequest({ id: "1" }, body));

        expect(read).toThrow(ValidationError);
    });
});
