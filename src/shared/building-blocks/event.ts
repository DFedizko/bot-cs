import { UUID } from "../domain-primitives/uuid";
import type { SubsetRequired } from "../types/subset";

export type Payload<T = undefined> = [T] extends [undefined] ? undefined : T;

export type EventProps<TPayload> = {
    eventId: string;
    name: string;
    payload?: Payload<TPayload>;
    ocurredAt: Date;
};

export type CreateEventProps<TPayload = undefined> = [TPayload] extends [undefined]
    ? SubsetRequired<Partial<EventProps<TPayload>>, "name">
    : SubsetRequired<Partial<EventProps<TPayload>>, "name" | "payload">;

export abstract class Event<TPayload = undefined> {
    protected static readonly EVENT_NAME: string;
    readonly eventId: string;
    readonly name: string;
    readonly payload: Payload<TPayload>;
    readonly ocurredAt: Date;

    constructor(props: CreateEventProps<TPayload>) {
        this.name = props.name;
        this.eventId = props?.eventId ?? UUID.create().getValue();
        this.payload = props?.payload as Payload<TPayload>;
        this.ocurredAt = props?.ocurredAt ?? new Date();
    }

    toPrimitives(): EventProps<TPayload> {
        return {
            eventId: this.eventId,
            name: this.name,
            ocurredAt: this.ocurredAt,
            ...(typeof this.payload !== "undefined" && { payload: this.payload }),
        };
    }
}
