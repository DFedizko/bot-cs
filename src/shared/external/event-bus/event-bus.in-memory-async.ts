import { EventBus } from "@/shared/application/event-bus";
import { EventListener } from "@/shared/application/event-listener";
import { DomainEvent } from "@/shared/building-blocks/domain-event";
import { ValueObject } from "@/shared/building-blocks/value-object";
import { EventEmitter } from "node:events";

export class EventBusInMemoryAsync extends EventEmitter implements EventBus {
    addSubscribers(subscribers: EventListener<DomainEvent<ValueObject<unknown>>>[]): void {
        subscribers.forEach((subscriber) => {
            this.on(subscriber.subscribedTo(), subscriber.on.bind(subscriber));
        });
    }

    publish(domainEvents: DomainEvent<ValueObject<unknown>>[]): void {
        domainEvents.forEach((domainEvent) => {
            this.emit(domainEvent.name, domainEvent);
        });
    }
}
