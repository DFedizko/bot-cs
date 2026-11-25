export abstract class Comparator<T> {
    abstract compare(first: T, second: T): number;
}
