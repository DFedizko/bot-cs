import type { QueryHandler } from "@/packages/building-blocks/query-handler";
import { CatalogSearch } from "../../domain/catalog-search/catalog-search";
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
        limit = CatalogSearch.DEFAULT_LIMIT,
    }: SearchCatalogItemsQuery): Promise<SearchCatalogItemsResponse> {
        return this.dao.search({ text, limit });
    }
}
