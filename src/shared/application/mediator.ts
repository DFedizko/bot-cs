import { BaseError } from "../building-blocks/base-error";
import type { Event } from "../building-blocks/event";

export type Handler = { eventName: string; handle: (event: Event<unknown>) => Promise<void> };

export class Mediator {
    readonly handlers = new Map<string, Handler[]>();

    subscribe(handlers: Handler[]): void {
        handlers.forEach((handler) => {
            const existingHandler = this.handlers.get(handler.eventName);
            this.handlers.set(handler.eventName, [...(this.handlers.get(handler.eventName) ?? []), handler]);
        });
    }

    async publish(events: Event[]): Promise<void> {
        for (const event of events) {
            for (const handler of this.handlers.get(event.name) ?? []) await handler.handle(event);
        }
    }
}
