import { ValueObject } from "@value-object";
import { EmptyStringError } from "../error/empty-string.error";

export abstract class TrimmedString extends ValueObject<string> {
    constructor(value: string) {
        const trimmedValue = value.trim();
        if (trimmedValue.length === 0) throw new EmptyStringError();
        super(trimmedValue);
    }
}
