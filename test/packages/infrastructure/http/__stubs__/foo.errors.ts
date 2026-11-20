import { DomainError } from "@/packages/error/domain-error";
import { BaseError } from "@/packages/building-blocks/base-error";

export class FooNotFoundError extends DomainError {
    constructor() {
        super({ message: "Foo not found", code: "FOO_NOT_FOUND" });
    }
}

export class SpecialFooNotFoundError extends FooNotFoundError {}

export class FooInternalError extends BaseError {
    constructor() {
        super({ message: "Foo database password leaked", code: "FOO_INTERNAL" });
    }
}
