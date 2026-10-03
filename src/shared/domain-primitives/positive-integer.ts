import { DomainError } from "../error/domain-error";
import { Integer } from "./integer";

export class PositiveInteger extends Integer {
    constructor(value: number) {
        if (value < 0) throw new DomainError({ message: `The value provided: "${value}" must be positive` });
        super(value);
    }
}
