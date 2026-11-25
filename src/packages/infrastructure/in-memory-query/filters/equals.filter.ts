import { Filter } from "./filter";

export class EqualsFilter<T, TValue> extends Filter<T> {
    constructor(
        private readonly valueOf: (item: T) => TValue,
        private readonly expected: TValue | undefined,
    ) {
        super();
    }

    matches(item: T): boolean {
        return this.expected === undefined || this.valueOf(item) === this.expected;
    }
}
