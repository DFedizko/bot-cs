import { ValueObject } from "./value-object";

export abstract class Entity<Id extends ValueObject<unknown>> {
    constructor(protected readonly id: Id) {}

    equals(entity: Entity<Id>): boolean {
        if (entity === undefined || entity === null) return false;
        return entity.id === this.id;
    }
}
