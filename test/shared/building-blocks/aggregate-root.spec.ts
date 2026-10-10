import { FooAggregateRoot } from "./__mocks__/FooAggregateRoot";
import { FooCreatedDomainEvent } from "./__mocks__/events/FooCreatedDomainEvent";

beforeEach(() => jest.setSystemTime(new Date()));
afterEach(() => jest.setSystemTime());

test("Should create an  root", () => {
    const fooAggregateRoot = new FooAggregateRoot("John Doe", "john.doe@email.com", 21);
    const events = fooAggregateRoot.pullDomainEvents();
    const [event] = events;
    expect(fooAggregateRoot.getId()).toBeTypeOf("string");
    expect(fooAggregateRoot.getName()).toBe("John Doe");
    expect(fooAggregateRoot.getEmail()).toBe("john.doe@email.com");
    expect(fooAggregateRoot.getAge()).toBe(21);
    expect(events).toHaveLength(1);
    expect(event).toBeInstanceOf(FooCreatedDomainEvent);
    expect(event.eventId).toBeTypeOf("string");
    expect(event.aggregateId.getValue()).toBe(fooAggregateRoot.getId());
    expect(event.name).toBe("foo_created");
    expect(event.payload).toMatchObject({ name: "John Doe", email: "john.doe@email.com", age: 21 });
    expect(event.ocurredAt).toEqual(new Date());
});
test("Should clear domain events after pulling them out", () => {
    const fooAggregateRoot = new FooAggregateRoot("John Doe", "john.doe@email.com", 21);
    fooAggregateRoot.pullDomainEvents();
    expect(fooAggregateRoot.pullDomainEvents()).toStrictEqual([]);
});
