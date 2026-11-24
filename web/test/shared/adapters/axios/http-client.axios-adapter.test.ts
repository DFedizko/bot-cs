import { describe, expect, it } from "bun:test";
import { HttpResponse, http } from "msw";
import { mswServer } from "@/__setup__/msw-server";
import { TEST_BOT_API_URL } from "@/__builders__/test-bot-api-url";
import { HttpClientAxiosAdapter } from "@/shared/adapters/axios/http-client.axios-adapter";
import { HttpError } from "@/shared/lib/http/http-error";

type Item = { id: string; name: string };

const ITEMS_PATH = "/items";
const ITEMS_URL = `${TEST_BOT_API_URL}${ITEMS_PATH}`;
const ITEM: Item = { id: "1", name: "AK-47 | Redline" };
const NEW_ITEM = { name: "AWP | Asiimov" };
const HEADER_NAME = "x-account-id";
const HEADER_VALUE = "account-1";
const DEFAULT_HEADER_NAME = "x-client";
const DEFAULT_HEADER_VALUE = "web";
const QUERY = { page: 2, search: "ak" };
const NO_CONTENT = 204;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const BAD_GATEWAY = 502;
const VALIDATION_ERROR_CODE = "VALIDATION_ERROR";
const VALIDATION_MESSAGE = "Invalid input: maxPrice";
const INVALID_FIELD = { path: "maxPrice", message: "Must be positive" };
const NOT_FOUND_CODE = "NOT_FOUND";
const NOT_FOUND_MESSAGE = "Wanted item not found";
const GATEWAY_PAGE = "<html>Bad gateway</html>";
const UNSERIALIZABLE_BODY = { amount: BigInt(1) };

const captureError = (error: unknown) => error;

const captureRequests = () => {
    const requests: Request[] = [];
    const capture = (request: Request) => requests.push(request.clone());
    return { requests, capture };
};

describe("HttpClientAxiosAdapter", () => {
    describe("Reading", () => {
        it("Should GET the path under the base URL and return the parsed JSON", async () => {
            mswServer.use(http.get(ITEMS_URL, () => HttpResponse.json(ITEM)));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            const result = await client.get<Item>(ITEMS_PATH);

            expect(result).toEqual(ITEM);
        });

        it("Should send the query parameters in the URL", async () => {
            const { requests, capture } = captureRequests();
            mswServer.use(http.get(ITEMS_URL, ({ request }) => (capture(request), HttpResponse.json([ITEM]))));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            await client.get<Item[]>(ITEMS_PATH, { query: QUERY });

            expect(Object.fromEntries(new URL(requests[0].url).searchParams)).toEqual({ page: "2", search: "ak" });
        });

        it("Should send the request headers", async () => {
            const { requests, capture } = captureRequests();
            mswServer.use(http.get(ITEMS_URL, ({ request }) => (capture(request), HttpResponse.json(ITEM))));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            await client.get<Item>(ITEMS_PATH, { headers: { [HEADER_NAME]: HEADER_VALUE } });

            expect(requests[0].headers.get(HEADER_NAME)).toBe(HEADER_VALUE);
        });

        it("Should send the default headers on every request", async () => {
            const { requests, capture } = captureRequests();
            mswServer.use(http.get(ITEMS_URL, ({ request }) => (capture(request), HttpResponse.json(ITEM))));
            const defaultHeaders = { [DEFAULT_HEADER_NAME]: DEFAULT_HEADER_VALUE };
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL, { defaultHeaders });

            await client.get<Item>(ITEMS_PATH, { headers: { [HEADER_NAME]: HEADER_VALUE } });

            expect(requests[0].headers.get(DEFAULT_HEADER_NAME)).toBe(DEFAULT_HEADER_VALUE);
        });
    });

    describe("Writing", () => {
        it("Should POST the body as JSON and return the parsed JSON", async () => {
            const { requests, capture } = captureRequests();
            mswServer.use(http.post(ITEMS_URL, ({ request }) => (capture(request), HttpResponse.json(ITEM))));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            const result = await client.post<Item>(ITEMS_PATH, { body: NEW_ITEM });

            expect({ result, sent: await requests[0].json() }).toEqual({ result: ITEM, sent: NEW_ITEM });
        });

        it("Should PUT the body as JSON", async () => {
            const { requests, capture } = captureRequests();
            mswServer.use(http.put(ITEMS_URL, ({ request }) => (capture(request), HttpResponse.json(ITEM))));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            await client.put<Item>(ITEMS_PATH, { body: NEW_ITEM });

            expect(await requests[0].json()).toEqual(NEW_ITEM);
        });

        it("Should PATCH the body as JSON", async () => {
            const { requests, capture } = captureRequests();
            mswServer.use(http.patch(ITEMS_URL, ({ request }) => (capture(request), HttpResponse.json(ITEM))));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            await client.patch<Item>(ITEMS_PATH, { body: NEW_ITEM });

            expect(await requests[0].json()).toEqual(NEW_ITEM);
        });

        it("Should DELETE the path and resolve when the bot answers without content", async () => {
            const { requests, capture } = captureRequests();
            const noContent = () => new HttpResponse(null, { status: NO_CONTENT });
            mswServer.use(http.delete(ITEMS_URL, ({ request }) => (capture(request), noContent())));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            await client.delete<void>(ITEMS_PATH);

            expect(requests).toHaveLength(1);
        });
    });

    describe("Failing", () => {
        it("Should throw an HttpError with the bot's error body and status", async () => {
            const errorBody = { code: VALIDATION_ERROR_CODE, message: VALIDATION_MESSAGE, fields: [INVALID_FIELD] };
            mswServer.use(http.post(ITEMS_URL, () => HttpResponse.json(errorBody, { status: BAD_REQUEST })));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            const error = await client.post<Item>(ITEMS_PATH, { body: NEW_ITEM }).catch(captureError);

            expect(error).toEqual(new HttpError({ status: BAD_REQUEST, ...errorBody }));
        });

        it("Should keep the bot's error body without fields as an error with no fields", async () => {
            const errorBody = { code: NOT_FOUND_CODE, message: NOT_FOUND_MESSAGE };
            mswServer.use(http.get(ITEMS_URL, () => HttpResponse.json(errorBody, { status: NOT_FOUND })));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            const error = await client.get<Item>(ITEMS_PATH).catch(captureError);

            expect(error).toMatchObject({ status: NOT_FOUND, ...errorBody, fields: [] });
        });

        it("Should throw an HttpError with the status when the error body isn't the bot's", async () => {
            mswServer.use(http.get(ITEMS_URL, () => HttpResponse.text(GATEWAY_PAGE, { status: BAD_GATEWAY })));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            const error = await client.get<Item>(ITEMS_PATH).catch(captureError);

            expect(error).toMatchObject({ status: BAD_GATEWAY, code: HttpError.UNEXPECTED_RESPONSE });
        });

        it("Should throw a network HttpError without status when the bot can't be reached", async () => {
            mswServer.use(http.get(ITEMS_URL, () => HttpResponse.error()));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            const error = await client.get<Item>(ITEMS_PATH).catch(captureError);

            expect(error).toMatchObject({ status: undefined, code: HttpError.NETWORK_ERROR });
        });

        it("Should throw an invalid request HttpError when the body can't be sent", async () => {
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            const error = await client.post<Item>(ITEMS_PATH, { body: UNSERIALIZABLE_BODY }).catch(captureError);

            expect(error).toMatchObject({ status: undefined, code: HttpError.INVALID_REQUEST });
        });

        it("Should throw an HttpError, never a library error", async () => {
            mswServer.use(http.get(ITEMS_URL, () => HttpResponse.error()));
            const client = new HttpClientAxiosAdapter(TEST_BOT_API_URL);

            const error = await client.get<Item>(ITEMS_PATH).catch(captureError);

            expect(error).toBeInstanceOf(HttpError);
        });
    });
});
