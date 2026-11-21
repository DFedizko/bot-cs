import { EventBusInMemoryAsync } from "@/packages/external/event-bus/event-bus.in-memory-async";
import { FooUpdatedDomainEvent } from "@/packages/building-blocks/__mocks__/events/FooUpdatedDomainEvent";
import { FooId } from "@/packages/building-blocks/__mocks__/FooId";
import { RecordingEventListener } from "./__stubs__/recording.event-listener";

const LISTENER = "listener";

describe("EventBusInMemoryAsync", () => {
    it("Should resolve publish before its listeners finish", async () => {
        const records: string[] = [];
        const eventBus = new EventBusInMemoryAsync();
        eventBus.addSubscribers([new RecordingEventListener(FooUpdatedDomainEvent.EVENT_NAME, LISTENER, records)]);

        await eventBus.publish([new FooUpdatedDomainEvent(FooId.create())]);

        expect(records).toEqual([]);
    });
});
