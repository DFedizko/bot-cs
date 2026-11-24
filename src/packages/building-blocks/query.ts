import type { QueryResponse } from "./query-response";

export abstract class Query<TResponse extends QueryResponse> {
    static readonly QUERY_NAME: string;
    readonly name: string;
    declare private readonly response?: TResponse;

    constructor() {
        this.name = new.target.QUERY_NAME;
    }
}
