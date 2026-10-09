import { EventBus } from "@/shared/application/event-bus";
import { EventListener } from "@/shared/application/event-listener";
import type { Event } from "@/shared/building-blocks/event";
import { EventEmitter } from "node:events";

export class EventBusInMemoryAsync extends EventEmitter implements EventBus {
    addSubscribers(subscribers: EventListener[]): void {
        subscribers.forEach((subscriber) => {
            this.on(subscriber.subscribedTo(), subscriber.on.bind(subscriber));
        });
    }

    publish(events: Event[]): void {
        events.forEach((event) => {
            this.emit(event.name, event);
        });
    }
}
