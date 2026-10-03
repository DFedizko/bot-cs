import { UUID } from "../domain-primitives/uuid";
import { Primitive, ValueObject } from "./value-object";

type Payload<T = undefined> = T extends undefined ? undefined : T;

type DomainEventProps<AggregateId, TPayload> = {
    aggregateId: AggregateId;
    eventId: string;
    name: string;
    payload: Payload<TPayload>;
    ocurredAt: Date;
};

export abstract class DomainEvent<AggregateId extends ValueObject<any>, TPayload = undefined> {
    static readonly EVENT_NAME: string;
    readonly eventId: string;
    readonly aggregateId: Primitive<AggregateId>;
    readonly name: string;
    readonly payload: Payload<TPayload>;
    readonly ocurredAt: Date;

    constructor(props: {
        eventId?: string;
        aggregateId: AggregateId;
        name: string;
        payload?: Payload<TPayload>;
        ocurredAt?: Date;
    }) {
        this.eventId = props?.eventId ?? UUID.create().getValue();
        this.aggregateId = props.aggregateId.getValue();
        this.name = props.name;
        this.payload = props?.payload as Payload<TPayload>;
        this.ocurredAt = props?.ocurredAt ?? new Date();
    }

    toPrimitives(): DomainEventProps<AggregateId, TPayload> {
        return {
            aggregateId: this.aggregateId,
            eventId: this.eventId,
            name: this.name,
            ocurredAt: this.ocurredAt,
            ...(typeof this.payload !== "undefined" && { payload: this.payload }),
        } as DomainEventProps<AggregateId, TPayload>;
    }
}
