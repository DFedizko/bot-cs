import type { paths } from "@/shared/api/bot-api";
import type { HttpClient } from "@/shared/lib/http/http-client";
import type { CatalogItem } from "../../model/catalog-item";
import type { CatalogService } from "../ports/catalog.service";

type CatalogBody = paths["/catalog/items"]["get"]["responses"][200]["content"]["application/json"];

export class CatalogHttpService implements CatalogService {
    static readonly PATH = "/catalog/items";
    static readonly LIMIT = 20;

    constructor(private readonly http: HttpClient) {}

    async search(query: string): Promise<Array<CatalogItem>> {
        const body = await this.http.get<CatalogBody>(CatalogHttpService.PATH, {
            query: { q: query, limit: CatalogHttpService.LIMIT },
        });
        return body.items;
    }
}
