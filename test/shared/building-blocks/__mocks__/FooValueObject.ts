import { ValueObject } from "@value-object";

export class FooValueObject extends ValueObject<string> {
    constructor(value: string) {
        super(value);
    }
}
