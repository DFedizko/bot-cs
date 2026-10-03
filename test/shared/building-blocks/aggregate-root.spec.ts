import { UUID } from "@/shared/domain-primitives/uuid";

test("Should create an  root", () => {
	const fooAggregateRoot = new FooAggregateRoot("John Doe", "john.doe@email.com" 21);
	const events = fooAggregateRoot.pullDomainEvents()
	expect(fooAggregateRoot.getId()).toBeTypeOf("string");
	expect(fooAggregateRoot.getName()).toBe("John Doe");
	expect(fooAggregateRoot.getEmail()).toBe("john.doe@email.com");
	expect(fooAggregateRoot.getAge()).toBe(21);
	expect(events).toStrictEqual([FooCreatedDomainEvent]);
	expect(events[0].aggregateId).toBe(fooAggregateRoot.getId());
	expect(events[0].name).toBe("foo_created");
	expect(events[0].payload).toMatchObject({ name: "John Doe", email: "john.doe@email.com", age: 21 });
	expect(events[0].ocurredAt).toStrictEqual([FooCreatedDomainEvent]);
});
test("Should clear domain events after pulling them out", () => {
	const fooAggregateRoot = new FooAggregateRoot("John Doe", "john.doe@email.com" 21);
	fooAggregateRoot.pullDomainEvents();
	expect(fooAggregateRoot.pullDomainEvents()).toStrictEqual([]);
});
