import { BaseError } from "../building-blocks/base-error";
import type { Event } from "../building-blocks/event";

export type Handler = { eventName: string; handle: (event: Event<unknown>) => Promise<void> };

export class Mediator {
    readonly handlers = new Map<string, Handler>();

    subscribe(handlers: Handler[]): void {
        handlers.forEach((handler) => {
            const existingHandler = this.handlers.get(handler.eventName);
            if (existingHandler)
                throw new BaseError({ message: `A handler alreary registered to the event: "${handler.eventName}"` });
            this.handlers.set(handler.eventName, handler);
        });
    }

    async publish(events: Event[]): Promise<void> {
        for (const event of events) {
            const handler = this.handlers.get(event.name);
            if (handler) await handler.handle(event);
        }
    }
}
