import type { Event } from "../building-blocks/event";

export interface EventListener<TEvent extends Event<unknown> = Event<unknown>> {
    subscribedTo(): string;
    on(event: TEvent): Promise<void>;
}
