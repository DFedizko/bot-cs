import { ValueObject } from "@value-object";

export class FooValueObject extends ValueObject<{ value: string }> {
    constructor(value: string) {
        super({ value });
    }

    getValue(): string {
        return this.props.value;
    }
}
