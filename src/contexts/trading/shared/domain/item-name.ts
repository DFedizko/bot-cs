import { TrimmedString } from "@/shared/domain-primitives/trimmed-string";
import { DomainError } from "@/shared/error/domain-error";

export class ItemName extends TrimmedString {
    private static readonly MAX_CHAR = 50;
    private static readonly MIN_CHAR = 3;

    private constructor(name: string) {
        super(name);
    }

    static create(name: string): ItemName {
        if (name.length > ItemName.MAX_CHAR)
            throw new DomainError({ message: `The name provided: "${name}" must have less than ${this.MAX_CHAR}` });
        if (name.length < ItemName.MIN_CHAR)
            throw new DomainError({ message: `The name provided: "${name}" must have more than ${this.MIN_CHAR}` });
        return new ItemName(name);
    }
}
