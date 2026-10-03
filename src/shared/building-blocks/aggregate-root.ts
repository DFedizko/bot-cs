import { DomainEvent } from "./domain-event";
import { Entity } from "./entity";
import { ValueObject } from "./value-object";

export abstract class AggregateRoot<AggregateId extends ValueObject<any>> extends Entity<AggregateId> {
    private domainEvents: DomainEvent<AggregateId, unknown>[] = [];

    record(domainEvent: DomainEvent<AggregateId, unknown>): void {
        this.domainEvents.push(domainEvent);
    }

    pullDomainEvents(): DomainEvent<AggregateId, unknown>[] {
        const domainEvents = this.domainEvents;
        this.domainEvents = [];
        return domainEvents;
    }
}
