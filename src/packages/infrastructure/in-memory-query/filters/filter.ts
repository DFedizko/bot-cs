export abstract class Filter<T> {
    abstract matches(item: T): boolean;
}
