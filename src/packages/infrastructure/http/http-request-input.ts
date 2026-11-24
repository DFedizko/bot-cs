import type { HttpRequest } from "./http-server";
import { ValidationError } from "../validation/validation.error";

type Fields = Record<string, unknown>;

const BODY_FIELD = { path: "body", message: "Expected a JSON object" };

export class HttpRequestInput {
    static from({ params, searchParams, body }: HttpRequest): Fields {
        return { ...searchParams, ...HttpRequestInput.readBody(body), ...params };
    }

    private static readBody(body: unknown): Fields {
        if (body === undefined) return {};
        if (!HttpRequestInput.isObject(body)) throw new ValidationError([BODY_FIELD]);
        return body;
    }

    private static isObject(value: unknown): value is Fields {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }
}
