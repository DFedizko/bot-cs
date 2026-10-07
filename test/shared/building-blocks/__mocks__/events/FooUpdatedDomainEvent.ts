import { DomainEvent } from "@/shared/building-blocks/domain-event";
import { FooId } from "../FooId";

export class FooUpdatedDomainEvent extends DomainEvent<FooId> {
    static readonly EVENT_NAME = "foo_updated";

    constructor(aggregateId: FooId) {
        super({ aggregateId, name: FooUpdatedDomainEvent.EVENT_NAME });
    }
}
