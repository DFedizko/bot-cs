import type { QueryHandler } from "@/packages/building-blocks/query-handler";
import { FooQuery, type FooResponse } from "./foo.query";

export class FooQueryHandler implements QueryHandler<FooQuery, FooResponse> {
    subscribedTo(): string {
        return FooQuery.QUERY_NAME;
    }

    async handle({ fooId }: FooQuery): Promise<FooResponse> {
        return { foo: fooId };
    }
}
