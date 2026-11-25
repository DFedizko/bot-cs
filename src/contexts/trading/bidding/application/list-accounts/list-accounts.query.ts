import { Query } from "@/packages/building-blocks/query";
import type { ListAccountsResponse } from "./list-accounts.response";

export class ListAccountsQuery extends Query<ListAccountsResponse> {
    static readonly QUERY_NAME = "list_accounts";
}
