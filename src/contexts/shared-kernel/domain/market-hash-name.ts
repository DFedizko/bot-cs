import { TrimmedString } from "@/packages/domain-primitives/trimmed-string";
import { DomainError } from "@/packages/error/domain-error";

export class MarketHashName extends TrimmedString {
    static readonly MAX_LENGTH = 128;

    constructor(value: string) {
        super(value);
        if (this.getValue().length > MarketHashName.MAX_LENGTH)
            throw new DomainError({
                message: `The market hash name "${this.getValue()}" must have at most ${MarketHashName.MAX_LENGTH} characters`,
            });
    }
}
