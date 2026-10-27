import { ValueObject } from "@/packages/building-blocks/value-object";

export class FooValueObject extends ValueObject<string> {
    constructor(value: string) {
        super(value);
    }
}
