import type { AggregateId } from "./aggregate-root";
import { type CreateEventProps, Event, type EventProps } from "./event";
import type { Primitive } from "./value-object";

type DomainEventPrimitives<TPayload> = EventProps<TPayload> & { aggregateId: Primitive<AggregateId> };

type CreateDomainEventProps<TPayload = undefined> = CreateEventProps<TPayload> & {
    aggregateId: AggregateId;
};

export abstract class DomainEvent<TPayload = undefined> extends Event<TPayload> {
    readonly aggregateId: AggregateId;

    constructor(props: CreateDomainEventProps<TPayload>) {
        super(props);
        this.aggregateId = props.aggregateId;
    }

    toPrimitives(): DomainEventPrimitives<TPayload> {
        return { ...super.toPrimitives(), aggregateId: this.aggregateId.getValue() };
    }
}
