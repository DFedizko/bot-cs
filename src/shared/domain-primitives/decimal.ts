import { ValueObject } from "../building-blocks/value-object";
import { DomainError } from "../error/domain-error";

export class Decimal extends ValueObject<{ value: number }> {
    constructor(value: number) {
        if (Number.isInteger(value))
            throw new DomainError({ message: `The number provided: "${value}" must be decimal` });
        super({ value });
    }

    getValue(): number {
        return this.props.value;
    }
}
