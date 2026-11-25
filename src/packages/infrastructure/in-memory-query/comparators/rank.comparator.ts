import { Comparator } from "./comparator";

export class RankComparator<T, TKey> extends Comparator<T> {
    constructor(
        private readonly keyOf: (item: T) => TKey | null | undefined,
        private readonly order: readonly TKey[],
        private readonly fallbackRank: number,
    ) {
        super();
    }

    compare(first: T, second: T): number {
        return this.rankOf(first) - this.rankOf(second);
    }

    private rankOf(item: T): number {
        const key = this.keyOf(item);
        return key === null || key === undefined ? this.fallbackRank : this.order.indexOf(key);
    }
}
