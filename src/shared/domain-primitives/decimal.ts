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

    getDecimalPlacesNumber(): number {
        const decimalPlaces = this.getDecimalPlaces();
        return decimalPlaces.length;
    }

    getDecimalPlaces(): string {
        return this.toString().split(".")[1];
    }

    private toString(): string {
        return this.props.value.toString();
    }
}
