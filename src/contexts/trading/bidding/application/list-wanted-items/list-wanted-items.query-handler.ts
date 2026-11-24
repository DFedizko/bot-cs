import type { QueryHandler } from "@/packages/building-blocks/query-handler";
import { withDefaultPage } from "@/packages/building-blocks/pagination";
import { ListWantedItemsQuery } from "./list-wanted-items.query";
import type { ListWantedItemsResponse } from "./list-wanted-items.response";
import type { WantedItemsDao } from "./wanted-items.dao";

export class ListWantedItemsQueryHandler implements QueryHandler<ListWantedItemsQuery, ListWantedItemsResponse> {
    constructor(private readonly dao: WantedItemsDao) {}

    subscribedTo(): string {
        return ListWantedItemsQuery.QUERY_NAME;
    }

    handle({ accountId, enabled, page, pageSize }: ListWantedItemsQuery): Promise<ListWantedItemsResponse> {
        return this.dao.list({ accountId, enabled }, withDefaultPage({ page, pageSize }));
    }
}
