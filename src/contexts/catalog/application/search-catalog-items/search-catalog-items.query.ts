import { Query } from "@/packages/building-blocks/query";
import type { SearchCatalogItemsResponse } from "./search-catalog-items.response";

type QueryProps = {
    text: string;
    limit?: number;
};

export class SearchCatalogItemsQuery extends Query<SearchCatalogItemsResponse> {
    static readonly QUERY_NAME = "search_catalog_items";
    static readonly MIN_TEXT_LENGTH = 2;
    static readonly DEFAULT_LIMIT = 20;
    static readonly MAX_LIMIT = 50;
    readonly text: string;
    readonly limit?: number;

    constructor(props: QueryProps) {
        super();
        this.text = props.text;
        this.limit = props.limit;
    }
}
