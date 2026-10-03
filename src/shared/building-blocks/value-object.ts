export type Primitive<T> = T extends ValueObject<infer U> ? Primitive<U> : T;

export abstract class ValueObject<T> {
    constructor(protected readonly value: T) {
        this.value = value;
        Object.freeze(this);
    }

    equals(other: ValueObject<T>): boolean {
        if (!other) return false;
        return (
            other.constructor.name === this.constructor.name &&
            JSON.stringify(other.value) === JSON.stringify(this.value)
        );
    }

    getValue(): Primitive<T> {
        return this.value instanceof ValueObject ? this.value.getValue() : (this.value as Primitive<T>);
    }
}
