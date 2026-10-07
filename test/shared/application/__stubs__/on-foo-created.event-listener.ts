import type { EventListener } from "@/shared/application/event-listener";
import type { FooRepository } from "@/shared/building-blocks/__mocks__/foo.repository";
import { FooCreatedDomainEvent } from "@/shared/building-blocks/__mocks__/events/FooCreatedDomainEvent";

export class OnFooCreatedEventListener implements EventListener<FooCreatedDomainEvent> {
    constructor(private readonly repo: FooRepository) {}

    subscribedTo(): string {
        return FooCreatedDomainEvent.EVENT_NAME;
    }

    async on(_domainEvent: FooCreatedDomainEvent): Promise<void> {
        await this.repo.save();
    }
}
