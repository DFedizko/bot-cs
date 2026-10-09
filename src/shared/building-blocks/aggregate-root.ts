import { DomainEvent } from "./domain-event";
import { Entity } from "./entity";
import { ValueObject } from "./value-object";

export type AggregateId = ValueObject<unknown>;

export abstract class AggregateRoot<TId extends AggregateId> extends Entity<TId> {
    private domainEvents: DomainEvent[] = [];

    record(domainEvent: DomainEvent): void {
        this.domainEvents.push(domainEvent);
    }

    pullDomainEvents(): DomainEvent[] {
        const domainEvents = this.domainEvents;
        this.domainEvents = [];
        return domainEvents;
    }
}
