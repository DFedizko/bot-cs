import { DomainError } from "../error/domain-error";
import { TrimmedString } from "./trimmed-string";

export abstract class BoundedString extends TrimmedString {
    constructor(value: string, { min, max, label }: { min: number; max: number; label: string }) {
        super(value);
        const length = this.getValue().length;
        if (length < min || length > max)
            throw new DomainError({
                message: `The ${label} "${this.getValue()}" must have between ${min} and ${max} characters`,
            });
    }
}
