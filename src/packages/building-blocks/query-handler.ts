import type { Query } from "./query";
import type { QueryResponse } from "./query-response";

export interface QueryHandler<TQuery extends Query<TResponse>, TResponse extends QueryResponse> {
    subscribedTo(): string;
    handle(query: TQuery): Promise<TResponse>;
}
