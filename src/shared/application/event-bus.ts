import type { EventListener } from "./event-listener";
import type { Event } from "../building-blocks/event";

export interface EventBus {
    addSubscribers(subscribers: EventListener[]): void;
    publish(domainEvents: Event<unknown>[]): void;
}
