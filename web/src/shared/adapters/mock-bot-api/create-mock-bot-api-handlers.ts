import { delay } from "msw";
import { createOpenApiHttp } from "openapi-msw";
import type { paths } from "@/shared/api/bot-api";
import { createMockCatalog } from "./create-mock-catalog";
import { createMockWantedItems } from "./create-mock-wanted-items";
import { listMockWantedItems } from "./list-mock-wanted-items";
import type { MockAccount } from "./mock-account";
import { MOCK_ACCOUNT_EXAMPLES } from "./mock-account-examples";
import type { MockCatalogItem } from "./mock-catalog-item";
import type { MockWantedItem, MockWantedItemsQuery } from "./mock-wanted-item";
import { searchMockCatalog } from "./search-mock-catalog";
import { toMockWantedItem } from "./to-mock-wanted-item";

export type MockBotApiData = {
    accounts?: ReadonlyArray<MockAccount>;
    wantedItems?: Readonly<Record<string, ReadonlyArray<MockWantedItem>>>;
    catalog?: ReadonlyArray<MockCatalogItem>;
    latencyMs?: number;
};

const NOT_FOUND = { code: "WANTED_ITEM_NOT_FOUND", message: "The account doesn't want the item" };
const MALFORMED_BODY = { code: "MALFORMED_BODY", message: "The request body is not valid JSON" };
const ALREADY_EXISTS = { code: "WANTED_ITEM_ALREADY_EXISTS", message: "The account already wants the item" };
const QUERY_KEYS = ["page", "pageSize", "sort", "order", "enabled"] as const;

const defaultWantedItems = (accounts: ReadonlyArray<MockAccount>) =>
    Object.fromEntries(accounts.slice(0, 1).map(({ id }) => [id, createMockWantedItems()]));

const readQuery = (read: (key: (typeof QUERY_KEYS)[number]) => string | null): MockWantedItemsQuery =>
    Object.fromEntries(
        QUERY_KEYS.map((key) => [key, read(key)]).filter(([, value]) => value !== null),
    ) as MockWantedItemsQuery;

export function createMockBotApiHandlers(baseUrl: string, data: MockBotApiData = {}) {
    const http = createOpenApiHttp<paths>({ baseUrl });
    const accounts = data.accounts ?? MOCK_ACCOUNT_EXAMPLES;
    const itemsByAccount = new Map(Object.entries(data.wantedItems ?? defaultWantedItems(accounts)));
    const itemsOf = (accountId: string) => itemsByAccount.get(accountId) ?? [];
    const catalog = data.catalog ?? createMockCatalog();
    const wait = () => delay(data.latencyMs ?? 0);
    const isWanted = (accountId: string, name: string) => itemsOf(accountId).some((item) => item.name === name);
    const findInCatalog = (name: string) => catalog.find(({ marketHashName }) => marketHashName === name);

    return [
        http.get("/accounts", async ({ response }) => {
            await wait();
            return response(200).json({ items: [...accounts] });
        }),
        http.get("/accounts/{accountId}/wanted-items", async ({ params, query, response }) => {
            await wait();
            const page = listMockWantedItems(
                itemsOf(params.accountId),
                readQuery((key) => query.get(key)),
            );
            return response(200).json(page);
        }),
        http.get("/catalog/items", async ({ query, response }) => {
            await wait();
            const limit = query.get("limit");
            const items = searchMockCatalog(catalog, query.get("q") ?? "", limit ? Number(limit) : undefined);
            return response(200).json({ items });
        }),
        http.post("/accounts/{accountId}/wanted-items", async ({ params, request, response }) => {
            await wait();
            const body = await request.json();
            if (!body) return response(400).json(MALFORMED_BODY);
            if (isWanted(params.accountId, body.name)) return response(409).json(ALREADY_EXISTS);
            const added = toMockWantedItem(body, findInCatalog(body.name), new Date().toISOString());
            itemsByAccount.set(params.accountId, [added, ...itemsOf(params.accountId)]);
            return response(200).empty();
        }),
        http.delete("/accounts/{accountId}/wanted-items/{name}", async ({ params, response }) => {
            await wait();
            if (!isWanted(params.accountId, params.name)) return response(404).json(NOT_FOUND);
            itemsByAccount.set(
                params.accountId,
                itemsOf(params.accountId).filter(({ name }) => name !== params.name),
            );
            return response(200).empty();
        }),
        http.patch("/accounts/{accountId}/wanted-items/{name}/enabled", async ({ params, request, response }) => {
            await wait();
            const body = await request.json();
            const items = itemsOf(params.accountId);
            if (!body || !items.some(({ name }) => name === params.name)) return response(404).json(NOT_FOUND);
            const { enabled } = body;
            itemsByAccount.set(
                params.accountId,
                items.map((item) => (item.name === params.name ? { ...item, enabled } : item)),
            );
            return response(200).empty();
        }),
    ];
}
