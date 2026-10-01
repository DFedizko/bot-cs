import { DomainError } from "./domain-error";

export class EmptyStringError extends DomainError {
    constructor() {
        super({ message: "The value provided must not be empty", code: "EMPTY_STRING" });
    }
}
