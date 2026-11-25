import type { Query } from "@/packages/building-blocks/query";
import type { QueryHandler } from "@/packages/building-blocks/query-handler";
import type { QueryResponse } from "@/packages/building-blocks/query-response";

export interface QueryBus {
    register(handler: QueryHandler<Query<QueryResponse>, QueryResponse>): void;
    ask<TResponse extends QueryResponse>(query: Query<TResponse>): Promise<TResponse>;
}
