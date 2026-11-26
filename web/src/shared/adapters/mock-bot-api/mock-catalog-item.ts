import type { paths } from "@/shared/api/bot-api";

export type MockCatalogItem =
    paths["/catalog/items"]["get"]["responses"][200]["content"]["application/json"]["items"][number];
