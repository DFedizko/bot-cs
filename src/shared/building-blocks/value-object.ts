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

    getValue<TValue = undefined>(): TValue extends undefined ? T : TValue {
        return this.value as TValue extends undefined ? T : TValue;
    }
}
