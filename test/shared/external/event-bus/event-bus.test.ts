import { EventBus } from "@/shared/application/event-bus";
import { FooCreatedDomainEvent } from "@/shared/building-blocks/__mocks__/events/FooCreatedDomainEvent";
import { FooId } from "@/shared/building-blocks/__mocks__/FooId";
import type { EventListener } from "@/shared/application/event-listener";
import { EventBusInMemoryAsync } from "@/shared/external/event-bus/event-bus.in-memory-async";
import { OnFooCreatedEventListener } from "@/shared/application/__stubs__/on-foo-created.event-listener";
import type { FooRepository } from "@/shared/building-blocks/__mocks__/foo.repository";
import { FooUpdatedDomainEvent } from "@/shared/building-blocks/__mocks__/events/FooUpdatedDomainEvent";
import { EventBusInMemorySync } from "@/shared/external/event-bus/event-bus.in-memory-sync";

let repo: FooRepository;
let eventListener: EventListener<FooCreatedDomainEvent>;
let eventBus: EventBus;
describe.each([
    ["In Memory Async", () => new EventBusInMemoryAsync()],
    ["In Memory Sync", () => new EventBusInMemorySync()],
])("Event Bus %s", (_name, createEventBus) => {
    beforeEach(() => {
        repo = { save: jest.fn(async () => {}) };
        eventListener = {
            subscribedTo: jest.fn(() => "foo_created"),
            on: jest.fn(async (_event: FooCreatedDomainEvent) => {}),
        };
        eventBus = createEventBus();
    });

    it("Should add one subscriber and publish a event", async () => {
        const domainEvent = new FooCreatedDomainEvent(FooId.create(), {
            age: 18,
            email: "john-doe@email.com",
            name: "John Doe",
        });
        eventBus.addSubscribers([eventListener]);
        await eventBus.publish([domainEvent]);
        expect(eventListener.on).toHaveBeenCalledTimes(1);
        expect(eventListener.on).toHaveBeenCalledWith(domainEvent);
    });
    it("Should add multiple subscribers and publish multiple events", async () => {
        const onCreated = new OnFooCreatedEventListener(repo);
        const onUpdated: EventListener<FooUpdatedDomainEvent> = {
            subscribedTo: jest.fn(() => "foo_updated"),
            on: jest.fn(async (_event: FooUpdatedDomainEvent) => {}),
        };
        const fooCreated = new FooCreatedDomainEvent(FooId.create(), {
            age: 18,
            email: "john-doe@email.com",
            name: "John Doe",
        });
        const fooUpdated = new FooUpdatedDomainEvent(FooId.create());
        const onCreatedSpy = jest.spyOn(onCreated, "on");
        eventBus.addSubscribers([onCreated, onUpdated]);
        await eventBus.publish([fooCreated, fooUpdated]);
        expect(onCreatedSpy).toHaveBeenCalledTimes(1);
        expect(onCreatedSpy).toHaveBeenCalledWith(fooCreated);
        expect(repo.save).toHaveBeenCalledTimes(1);
        expect(onUpdated.on).toHaveBeenCalledTimes(1);
        expect(onUpdated.on).toHaveBeenCalledWith(fooUpdated);
        await eventBus.publish([fooUpdated]);
        expect(onUpdated.on).toHaveBeenCalledTimes(2);
        expect(onUpdated.on).toHaveBeenCalledWith(fooUpdated);
    });
});
