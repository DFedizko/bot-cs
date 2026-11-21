import type { EventBus } from "@/packages/application/event-bus";
import { EventBusInMemorySync } from "@/packages/external/event-bus/event-bus.in-memory-sync";
import { FooUpdatedDomainEvent } from "@/packages/building-blocks/__mocks__/events/FooUpdatedDomainEvent";
import { FooCreatedDomainEvent } from "@/packages/building-blocks/__mocks__/events/FooCreatedDomainEvent";
import { FooId } from "@/packages/building-blocks/__mocks__/FooId";
import { RecordingEventListener } from "./__stubs__/recording.event-listener";

const FIRST = "first";
const SECOND = "second";
const NESTED = "nested";
const FAILURE = "listener failed after an await";

const SLOW_STEPS = 5;

const slowReaction = (): Promise<void> =>
    Array.from({ length: SLOW_STEPS }).reduce<Promise<void>>(
        (chain) => chain.then(() => Promise.resolve()),
        Promise.resolve(),
    );
const fooUpdated = () => new FooUpdatedDomainEvent(FooId.create());
const fooCreated = () =>
    new FooCreatedDomainEvent(FooId.create(), { age: 18, email: "john-doe@email.com", name: "John Doe" });

describe("EventBusInMemorySync", () => {
    it("Should finish every listener before publish resolves", async () => {
        const records: string[] = [];
        const eventBus = new EventBusInMemorySync();
        eventBus.addSubscribers([new RecordingEventListener(FooUpdatedDomainEvent.EVENT_NAME, FIRST, records)]);

        await eventBus.publish([fooUpdated()]);

        expect(records).toEqual([FIRST]);
    });

    it("Should run the listeners one after another in subscription order", async () => {
        const records: string[] = [];
        const eventBus = new EventBusInMemorySync();
        eventBus.addSubscribers([
            new RecordingEventListener(FooUpdatedDomainEvent.EVENT_NAME, FIRST, records, slowReaction),
            new RecordingEventListener(FooUpdatedDomainEvent.EVENT_NAME, SECOND, records),
        ]);

        await eventBus.publish([fooUpdated()]);

        expect(records).toEqual([FIRST, SECOND]);
    });

    it("Should reject publish with the error a listener throws after an await", async () => {
        const eventBus = new EventBusInMemorySync();
        eventBus.addSubscribers([
            new RecordingEventListener(FooUpdatedDomainEvent.EVENT_NAME, FIRST, [], async () => {
                throw new Error(FAILURE);
            }),
        ]);

        const publishing = eventBus.publish([fooUpdated()]);

        await expect(publishing).rejects.toThrow(FAILURE);
    });

    it("Should stop the chain at the listener that failed", async () => {
        const records: string[] = [];
        const eventBus = new EventBusInMemorySync();
        eventBus.addSubscribers([
            new RecordingEventListener(FooUpdatedDomainEvent.EVENT_NAME, FIRST, records, async () => {
                throw new Error(FAILURE);
            }),
            new RecordingEventListener(FooUpdatedDomainEvent.EVENT_NAME, SECOND, records),
        ]);

        await eventBus.publish([fooUpdated()]).catch(() => {});

        expect(records).toEqual([]);
    });

    it("Should finish the events a listener publishes before the outer publish resolves", async () => {
        const records: string[] = [];
        const eventBus: EventBus = new EventBusInMemorySync();
        eventBus.addSubscribers([
            new RecordingEventListener(FooUpdatedDomainEvent.EVENT_NAME, FIRST, records, () =>
                eventBus.publish([fooCreated()]),
            ),
            new RecordingEventListener(FooCreatedDomainEvent.EVENT_NAME, NESTED, records),
        ]);

        await eventBus.publish([fooUpdated()]);

        expect(records).toEqual([NESTED, FIRST]);
    });
});
