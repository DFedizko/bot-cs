import { ValueObject } from "@value-object";
import { EmptyStringError } from "../error/empty-string.error";

export class TrimmedString extends ValueObject<{ value: string }> {
    constructor(value: string) {
        const trimmedValue = value.trim();
        if (trimmedValue.length === 0) throw new EmptyStringError();
        super({ value: trimmedValue });
    }

    getValue(): string {
        return this.props.value;
    }
}
