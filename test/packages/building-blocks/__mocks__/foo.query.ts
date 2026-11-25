import { Query } from "@/packages/building-blocks/query";

export type FooResponse = { foo: string };

export class FooQuery extends Query<FooResponse> {
    static readonly QUERY_NAME = "foo_query";

    constructor(readonly fooId: string) {
        super();
    }
}
