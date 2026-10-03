import { AggregateRoot } from "@aggregate-root";
import { FooId } from "./FooId";
import { FooCreatedDomainEvent } from "./FooCreatedDomainEvent";

export class FooAggregateRoot extends AggregateRoot<FooId> {
    constructor(
        private readonly name: string,
        private readonly email: string,
        private readonly age: number,
    ) {
        const id = FooId.create();
        super(id);
        this.record(new FooCreatedDomainEvent(id, { email, name, age }));
    }

    getId(): string {
        return this.id.getValue();
    }

    getName(): string {
        return this.name;
    }

    getEmail(): string {
        return this.email;
    }

    getAge(): number {
        return this.age;
    }
}
