import type { paths } from "@/shared/api/bot-api";

export type MockWantedItemsPage =
    paths["/accounts/{accountId}/wanted-items"]["get"]["responses"][200]["content"]["application/json"];

export type MockWantedItemsQuery = NonNullable<
    paths["/accounts/{accountId}/wanted-items"]["get"]["parameters"]["query"]
>;

export type MockWantedItem = MockWantedItemsPage["items"][number];
