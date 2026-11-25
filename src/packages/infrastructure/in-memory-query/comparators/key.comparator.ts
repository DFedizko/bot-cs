import { Comparator } from "./comparator";

type Key = number | string;

export class KeyComparator<T, TKey extends Key = Key> extends Comparator<T> {
    constructor(private readonly keyOf: (item: T) => TKey) {
        super();
    }

    compare(first: T, second: T): number {
        return this.compareKeys(this.keyOf(first), this.keyOf(second));
    }

    private compareKeys(first: TKey, second: TKey): number {
        return typeof first === "string" && typeof second === "string"
            ? first.localeCompare(second)
            : Number(first) - Number(second);
    }
}
