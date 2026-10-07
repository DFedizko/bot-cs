import type { EventListener } from "@/shared/application/event-listener";
import { OnFooCreatedEventListener } from "./__stubs__/on-foo-created.event-listener";
import type { FooRepository } from "../building-blocks/__mocks__/foo.repository";
import { FooCreatedDomainEvent } from "../building-blocks/__mocks__/events/FooCreatedDomainEvent";
import { FooId } from "../building-blocks/__mocks__/FooId";

let repo: FooRepository;
let eventListener: EventListener<FooCreatedDomainEvent>;

beforeEach(() => {
    repo = { save: jest.fn(async () => {}) };
    eventListener = new OnFooCreatedEventListener(repo);
});

describe("Event Listener", () => {
    it("Should react a domain event", async () => {
        await eventListener.on(
            new FooCreatedDomainEvent(FooId.create(), { age: 20, email: "johndoe@email.com", name: "John Doe" }),
        );
        expect(eventListener.subscribedTo()).toBe("foo_created");
        expect(repo.save).toHaveBeenCalledTimes(1);
    });
});
