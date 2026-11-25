export type Foo = {
    name: string;
    size: number;
    color?: string;
};

export const SMALL_APPLE: Foo = { name: "apple", size: 1, color: "red" };
export const BIG_PEAR: Foo = { name: "pear", size: 3, color: "green" };
export const MID_BANANA: Foo = { name: "banana", size: 2 };
export const BIG_KIWI: Foo = { name: "kiwi", size: 3, color: "green" };

export const sortedBy = <T>(items: T[], compare: (first: T, second: T) => number): T[] => items.toSorted(compare);
