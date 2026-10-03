import { DomainEvent } from "@domain-event";
import type { FooId } from "./FooId";

type Payload = { name: string; email: string; age: number };

export class FooCreatedDomainEvent extends DomainEvent<FooId, Payload> {
    static readonly EVENT_NAME = "foo_created";

    constructor(id: FooId, payload: Payload) {
        super({ aggregateId: id, name: FooCreatedDomainEvent.EVENT_NAME, payload });
    }
}
