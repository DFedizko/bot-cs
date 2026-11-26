import type { paths } from "@/shared/api/bot-api";
import type { HttpClient } from "@/shared/lib/http/http-client";
import type { MaxFor } from "../model/max-for";
import type { WantedItem } from "../model/wanted-item";
import type { WantedItemsPage } from "../model/wanted-items-page";
import type { WantedItemsQuery } from "../model/wanted-items-query";
import type { WantedItemsService } from "../ports/wanted-items.service";

type ListOperation = paths["/accounts/{accountId}/wanted-items"]["get"];
type WantedItemsBody = ListOperation["responses"][200]["content"]["application/json"];
type WantedItemBody = WantedItemsBody["items"][number];
type EnabledBody = NonNullable<
    paths["/accounts/{accountId}/wanted-items/{name}/enabled"]["patch"]["requestBody"]
>["content"]["application/json"];

const wantedItemsPath = (accountId: string) => `/accounts/${encodeURIComponent(accountId)}/wanted-items`;

const enabledPath = (accountId: string, name: string) =>
    `${wantedItemsPath(accountId)}/${encodeURIComponent(name)}/enabled`;

const toMaxFor = (maxFor: WantedItemBody["maxFor"]): MaxFor =>
    maxFor.type === "percentage" ? { type: "percentage", value: Number(maxFor.value) } : maxFor;

const toWantedItem = ({ name, maxFor, enabled, addedAt, catalog }: WantedItemBody): WantedItem => ({
    name,
    maxFor: toMaxFor(maxFor),
    enabled,
    addedAt,
    catalog,
});

export class WantedItemsHttpService implements WantedItemsService {
    constructor(private readonly http: HttpClient) {}

    async list(accountId: string, query: WantedItemsQuery): Promise<WantedItemsPage> {
        const body = await this.http.get<WantedItemsBody>(wantedItemsPath(accountId), { query: { ...query } });
        return { ...body, items: body.items.map(toWantedItem) };
    }

    async setEnabled(accountId: string, name: string, enabled: boolean): Promise<void> {
        await this.http.patch<void, EnabledBody>(enabledPath(accountId, name), { body: { enabled } });
    }
}
