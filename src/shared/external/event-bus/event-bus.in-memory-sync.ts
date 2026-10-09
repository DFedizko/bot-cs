import type { EventBus } from "@/shared/application/event-bus";
import type { EventListener } from "@/shared/application/event-listener";
import { Mediator } from "@/shared/application/mediator";

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
