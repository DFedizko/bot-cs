import { Comparator } from "./comparator";

export class ReversedComparator<T> extends Comparator<T> {
    constructor(private readonly comparator: Comparator<T>) {
        super();
    }

    compare(first: T, second: T): number {
        return this.comparator.compare(second, first);
    }
}
