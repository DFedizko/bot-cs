import { Integer } from "@/shared/domain-primitives/integer";
import { DomainError } from "@/shared/error/domain-error";

const MAX_POSITION = 5;
const MIN_POSITION = 1;

export class StickerSlot extends Integer {
    constructor(position: number) {
        if (position > MAX_POSITION)
            throw new DomainError({
                message: `The position provided: "${position}" must be less than ${MAX_POSITION}`,
            });
        if (position < MIN_POSITION)
            throw new DomainError({
                message: `The position provided: "${position}" must be bigger than ${MIN_POSITION}`,
            });
        super(position);
    }
}
