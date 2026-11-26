import { delay } from "msw";
import { createOpenApiHttp } from "openapi-msw";
import type { paths } from "@/shared/api/bot-api";
import { createMockWantedItems } from "./create-mock-wanted-items";
import { listMockWantedItems } from "./list-mock-wanted-items";
import type { MockAccount } from "./mock-account";
import { MOCK_ACCOUNT_EXAMPLES } from "./mock-account-examples";
import type { MockWantedItem, MockWantedItemsQuery } from "./mock-wanted-item";

export type MockBotApiData = {
    accounts?: ReadonlyArray<MockAccount>;
    wantedItems?: Readonly<Record<string, ReadonlyArray<MockWantedItem>>>;
    latencyMs?: number;
};

const NOT_FOUND = { code: "NOT_FOUND", message: "The wanted item doesn't exist" };
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
    const wait = () => delay(data.latencyMs ?? 0);

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
