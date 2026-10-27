import { ValueObject } from "../building-blocks/value-object";
import { DomainError } from "../error/domain-error";

export class Decimal extends ValueObject<number> {
    constructor(value: number) {
        if (Number.isInteger(value))
            throw new DomainError({ message: `The number provided: "${value}" must be decimal` });
        super(value);
    }

    getDecimalPlacesNumber(): number {
        const decimalPlaces = this.getDecimalPlaces();
        return decimalPlaces.length;
    }

    getDecimalPlaces(): string {
        const some = this.toString().split(".")[1];
        return some;
    }

    private toString(): string {
        const formatter = new Intl.NumberFormat("en-US", { notation: "standard", maximumFractionDigits: 25 });
        return formatter.format(this.value);
    }
}
