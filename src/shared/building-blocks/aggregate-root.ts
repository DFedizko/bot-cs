import { DomainEvent } from "./domain-event";
import { Entity } from "./entity";
import { ValueObject } from "./value-object";

export abstract class AggregateRoot<AggregateId extends ValueObject<{ value: unknown }>> extends Entity<AggregateId> {
    private readonly domainEvents: DomainEvent<AggregateId>[] = [];

    record(domainEvent: DomainEvent<AggregateId>): void {
        this.domainEvents.push(domainEvent);
    }

    pullDomainEvents(): DomainEvent<AggregateId>[] {
        const domainEvents = this.domainEvents;
        this.domainEvents.length = 0;
        return domainEvents;
    }
}
