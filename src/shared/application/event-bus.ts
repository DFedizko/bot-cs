import type { EventListener } from "./event-listener";
import { DomainEvent } from "../building-blocks/domain-event";
import { ValueObject } from "../building-blocks/value-object";

export interface EventBus {
    addSubscribers(subscribers: EventListener<DomainEvent<ValueObject<unknown>, unknown>>[]): void;
    publish(domainEvents: DomainEvent<ValueObject<unknown>, unknown>[]): void;
}
