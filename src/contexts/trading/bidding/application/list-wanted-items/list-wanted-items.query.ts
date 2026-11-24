import { Query } from "@/packages/building-blocks/query";
import type { ListWantedItemsResponse } from "./list-wanted-items.response";

type QueryProps = {
    accountId: number;
    enabled?: boolean;
    page?: number;
    pageSize?: number;
};

export class ListWantedItemsQuery extends Query<ListWantedItemsResponse> {
    static readonly QUERY_NAME = "list_wanted_items";
    readonly accountId: number;
    readonly enabled?: boolean;
    readonly page?: number;
    readonly pageSize?: number;

    constructor(props: QueryProps) {
        super();
        this.accountId = props.accountId;
        this.enabled = props.enabled;
        this.page = props.page;
        this.pageSize = props.pageSize;
    }
}
