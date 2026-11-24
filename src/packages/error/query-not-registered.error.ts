import { BaseError } from "../building-blocks/base-error";

export class QueryNotRegisteredError extends BaseError {
    constructor(query: string) {
        super({ message: `Query: "${query}" not registered`, code: "QUERY_NOT_REGISTERED" });
    }
}
