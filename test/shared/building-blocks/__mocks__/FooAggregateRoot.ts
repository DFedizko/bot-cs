import { AggregateRoot } from "@aggregate-root";
import { FooId } from "./FooId";

export class FooAggregateRoot extends AggregateRoot<FooId> {
    constructor(
        private readonly name: string,
        private readonly email: string,
        private readonly age: number,
    ) {
        super();
    }

    getId(): string {
        return this.id.getValue();
    }
}
