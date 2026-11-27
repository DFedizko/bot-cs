import { ApplicationEvent } from "@/packages/building-blocks/application-event";
import { FooHappenedIntegrationEvent, fooHappenedPayload } from "./__mocks__/events/FooHappenedIntegrationEvent";

describe("IntegrationEvent", () => {
    it("Should be an application event", () => {
        const event = new FooHappenedIntegrationEvent(fooHappenedPayload());

        expect(event).toBeInstanceOf(ApplicationEvent);
    });

    it("Should keep its name and payload", () => {
        const event = new FooHappenedIntegrationEvent(fooHappenedPayload());

        expect(event.toPrimitives()).toMatchObject({
            name: FooHappenedIntegrationEvent.EVENT_NAME,
            payload: fooHappenedPayload(),
        });
    });

    it("Should freeze its payload", () => {
        const event = new FooHappenedIntegrationEvent(fooHappenedPayload());

        expect(Object.isFrozen(event.payload)).toBe(true);
    });

    it("Should not change when the given payload changes later", () => {
        const payload = fooHappenedPayload();
        const event = new FooHappenedIntegrationEvent(payload);

        payload.fooId = 2;

        expect(event.payload.fooId).toBe(fooHappenedPayload().fooId);
    });

    it("Should freeze the lists inside its payload", () => {
        const event = new FooHappenedIntegrationEvent(fooHappenedPayload());

        expect(Object.isFrozen(event.payload.tags)).toBe(true);
    });
});
