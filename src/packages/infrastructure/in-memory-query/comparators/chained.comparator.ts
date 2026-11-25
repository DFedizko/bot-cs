import { Comparator } from "./comparator";

const EQUAL = 0;

export class ChainedComparator<T> extends Comparator<T> {
    private readonly comparators: Comparator<T>[];

    constructor(primary: Comparator<T>, ...tieBreakers: Comparator<T>[]) {
        super();
        this.comparators = [primary, ...tieBreakers];
    }

    compare(first: T, second: T): number {
        return this.comparators.reduce((result, comparator) => result || comparator.compare(first, second), EQUAL);
    }
}
