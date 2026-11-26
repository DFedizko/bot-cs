import type { paths } from "@/shared/api/bot-api";
import type { HttpClient } from "@/shared/lib/http/http-client";
import { HttpError } from "@/shared/lib/http/http-error";
import { AlreadyWantedError } from "../../model/already-wanted.error";
import type { MaxFor } from "../../model/max-for";
import type { NewWantedItem } from "../../model/new-wanted-item";
import type { WantedItem } from "../../model/wanted-item";
import type { WantedItemsPage } from "../../model/wanted-items-page";
import type { WantedItemsQuery } from "../../model/wanted-items-query";
import type { WantedItemsService } from "../ports/wanted-items.service";

type ListOperation = paths["/accounts/{accountId}/wanted-items"]["get"];
type WantedItemsBody = ListOperation["responses"][200]["content"]["application/json"];
type WantedItemBody = WantedItemsBody["items"][number];
type EnabledBody = NonNullable<
    paths["/accounts/{accountId}/wanted-items/{name}/enabled"]["patch"]["requestBody"]
>["content"]["application/json"];
type AddBody = NonNullable<
    paths["/accounts/{accountId}/wanted-items"]["post"]["requestBody"]
>["content"]["application/json"];

export class WantedItemsHttpService implements WantedItemsService {
    static readonly CONFLICT = 409;
    static readonly NOT_FOUND = 404;

    constructor(private readonly http: HttpClient) {}

    async list(accountId: string, query: WantedItemsQuery): Promise<WantedItemsPage> {
        const body = await this.http.get<WantedItemsBody>(this.wantedItemsPath(accountId), { query: { ...query } });
        return { ...body, items: body.items.map((item) => this.toWantedItem(item)) };
    }

    async setEnabled(accountId: string, name: string, enabled: boolean): Promise<void> {
        await this.http.patch<void, EnabledBody>(this.enabledPath(accountId, name), { body: { enabled } });
    }

    async add(accountId: string, { name, maxFor, criteria }: NewWantedItem): Promise<void> {
        await this.http
            .post<void, AddBody>(this.wantedItemsPath(accountId), { body: { name, maxFor, criteria } })
            .catch((error: unknown) => this.rejectAdd(error, name));
    }

    async remove(accountId: string, name: string): Promise<void> {
        await this.http
            .delete<void>(this.itemPath(accountId, name))
            .catch((error: unknown) => this.ignoreMissing(error));
    }

    private rejectAdd(error: unknown, name: string): never {
        if (error instanceof HttpError && error.status === WantedItemsHttpService.CONFLICT)
            throw new AlreadyWantedError(name);
        throw error;
    }

    private ignoreMissing(error: unknown): void {
        if (error instanceof HttpError && error.status === WantedItemsHttpService.NOT_FOUND) return;
        throw error;
    }

    private wantedItemsPath(accountId: string): string {
        return `/accounts/${encodeURIComponent(accountId)}/wanted-items`;
    }

    private toWantedItem({ name, maxFor, enabled, addedAt, catalog }: WantedItemBody): WantedItem {
        return { name, maxFor: this.toMaxFor(maxFor), enabled, addedAt, catalog };
    }

    private toMaxFor(maxFor: WantedItemBody["maxFor"]): MaxFor {
        return maxFor.type === "percentage" ? { type: "percentage", value: Number(maxFor.value) } : maxFor;
    }

    private itemPath(accountId: string, name: string): string {
        return `${this.wantedItemsPath(accountId)}/${encodeURIComponent(name)}`;
    }

    private enabledPath(accountId: string, name: string): string {
        return `${this.itemPath(accountId, name)}/enabled`;
    }
}
