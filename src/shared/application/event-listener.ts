import { DomainEvent } from "../building-blocks/domain-event";
import { ValueObject } from "../building-blocks/value-object";

export interface EventListener<T extends DomainEvent<ValueObject<any>, unknown>> {
    subscribedTo(): string;
    on(domainEvents: T): Promise<void>;
}
