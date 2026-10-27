import { ValueObject } from "../building-blocks/value-object";
import { DomainError } from "../error/domain-error";

export class Integer extends ValueObject<number> {
    constructor(value: number) {
        if (!Number.isInteger(value))
            throw new DomainError({ message: `The number provided: "${value}" must be integer` });
        super(value);
    }

    getValue(): number {
        return this.value;
    }
}
