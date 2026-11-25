import { DomainError } from "@/packages/error/domain-error";

export class NonPositiveMaxValueError extends DomainError {
    constructor(cents: number) {
        super({ message: `The max value "${cents}" must be above zero coin cents`, code: "NON_POSITIVE_MAX_VALUE" });
    }
}
