import type { EventBus } from "@/packages/application/event-bus";
import type { EventListener } from "@/packages/application/event-listener";
import { Mediator } from "@/packages/application/mediator";

export class EventBusInMemorySync extends Mediator implements EventBus {
    addSubscribers(subscribers: EventListener[]): void {
        this.subscribe(
            subscribers.map((subscriber) => ({
                eventName: subscriber.subscribedTo(),
                handle: async (event) => subscriber.on(event),
            })),
        );
    }
}
