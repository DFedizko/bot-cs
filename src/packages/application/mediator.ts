import type { Event } from "../building-blocks/event";

export type Handler = { eventName: string; handle: (event: Event<unknown>) => Promise<void> };

export class Mediator {
    readonly handlers = new Map<string, Handler[]>();

    subscribe(handlers: Handler[]): void {
        handlers.forEach((handler) => {
            this.handlers.set(handler.eventName, [...(this.handlers.get(handler.eventName) ?? []), handler]);
        });
    }

    async publish(events: Event[]): Promise<void> {
        await events.reduce((previous, event) => previous.then(() => this.notify(event)), Promise.resolve());
    }

    private async notify(event: Event): Promise<void> {
        await (this.handlers.get(event.name) ?? []).reduce(
            (previous, handler) => previous.then(() => handler.handle(event)),
            Promise.resolve(),
        );
    }
}
