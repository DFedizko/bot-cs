import type { HttpRequest } from "@/packages/infrastructure/http/http-server";
import { HttpRequestInput } from "@/packages/infrastructure/http/http-request-input";
import { ValidationError } from "@/packages/infrastructure/validation/validation.error";

const fooRequest = (params: Record<string, string>, body: unknown): HttpRequest => ({
    params,
    searchParams: {},
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

    it.each([["a text"], [["a", "list"]], [null]])("Should reject the body %p that is not an object", (body) => {
        const read = () => HttpRequestInput.from(fooRequest({ id: "1" }, body));

        expect(read).toThrow(ValidationError);
    });
});
