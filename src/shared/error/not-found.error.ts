import { BaseError } from "../building-blocks/base-error";

export class NotFoundError extends BaseError {
    constructor(message?: string) {
        super({ message: message ?? "Not found", code: "NOT_FOUND" });
    }
}
