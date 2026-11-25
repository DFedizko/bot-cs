import type { QueryBus } from "@/packages/application/query-bus";
import type { Query } from "@/packages/building-blocks/query";
import type { QueryHandler } from "@/packages/building-blocks/query-handler";
import type { QueryResponse } from "@/packages/building-blocks/query-response";
import { QueryNotRegisteredError } from "@/packages/error/query-not-registered.error";

type AnyQueryHandler = QueryHandler<Query<QueryResponse>, QueryResponse>;

export class QueryBusInMemory implements QueryBus {
    private readonly handlers = new Map<string, AnyQueryHandler>();

    register(handler: AnyQueryHandler): void {
        this.handlers.set(handler.subscribedTo(), handler);
    }

    async ask<TResponse extends QueryResponse>(query: Query<TResponse>): Promise<TResponse> {
        const handler = this.handlers.get(query.name);
        if (!handler) throw new QueryNotRegisteredError(query.name);
        return (await handler.handle(query)) as TResponse;
    }
}
