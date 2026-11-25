import type { QueryHandler } from "@/packages/building-blocks/query-handler";
import { SearchCatalogItemsQuery } from "./search-catalog-items.query";
import type { SearchCatalogItemsResponse } from "./search-catalog-items.response";
import type { CatalogItemsDao } from "./catalog-items.dao";

export class SearchCatalogItemsQueryHandler implements QueryHandler<
    SearchCatalogItemsQuery,
    SearchCatalogItemsResponse
> {
    constructor(private readonly dao: CatalogItemsDao) {}

    subscribedTo(): string {
        return SearchCatalogItemsQuery.QUERY_NAME;
    }

    handle({
        text,
        limit = SearchCatalogItemsQuery.DEFAULT_LIMIT,
    }: SearchCatalogItemsQuery): Promise<SearchCatalogItemsResponse> {
        return this.dao.search({ text, limit });
    }
}
