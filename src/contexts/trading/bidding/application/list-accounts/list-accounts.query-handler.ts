import type { QueryHandler } from "@/packages/building-blocks/query-handler";
import { ListAccountsQuery } from "./list-accounts.query";
import type { ListAccountsResponse } from "./list-accounts.response";
import type { AccountsDao } from "./accounts.dao";

export class ListAccountsQueryHandler implements QueryHandler<ListAccountsQuery, ListAccountsResponse> {
    constructor(private readonly dao: AccountsDao) {}

    subscribedTo(): string {
        return ListAccountsQuery.QUERY_NAME;
    }

    handle(): Promise<ListAccountsResponse> {
        return this.dao.list();
    }
}
