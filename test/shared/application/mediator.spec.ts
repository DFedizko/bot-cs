import { FooEvent } from "./__mocks__/foo.event";
import { UpdatedEvent } from "./__mocks__/updated.event";
import { CreatedEvent } from "./__mocks__/created.event";
import { Mediator, type Handler } from "@/shared/application/mediator";
import { BaseError } from "@/shared/building-blocks/base-error";

const fooEvent = new FooEvent();
const createdEvent = new CreatedEvent();
const updatedEvent = new UpdatedEvent();
test("Should publish an event and calls interested handlers", async () => {
    const mediator = new Mediator();
    const handler: Handler = { eventName: fooEvent.name, handle: async () => {} };
    const spyHandler = jest.spyOn(handler, "handle");
    mediator.subscribe([handler]);
    await mediator.publish([fooEvent]);
    expect(spyHandler).toHaveBeenCalledWith(fooEvent);
});
test("Should publish three different events and calls interested handlers", async () => {
    const mediator = new Mediator();
    const fooHandler: Handler = { eventName: fooEvent.name, handle: async () => {} };
    const createdHandler: Handler = { eventName: createdEvent.name, handle: async () => {} };
    const updatedHandler: Handler = { eventName: updatedEvent.name, handle: async () => {} };
    const spyFooHandler = jest.spyOn(fooHandler, "handle");
    const spyCreatedHandler = jest.spyOn(createdHandler, "handle");
    const spyUpdatedHandler = jest.spyOn(updatedHandler, "handle");
    mediator.subscribe([fooHandler, createdHandler, updatedHandler]);
    await mediator.publish([fooEvent, createdEvent, updatedEvent]);
    expect(spyFooHandler).toHaveBeenCalledWith(fooEvent);
    expect(spyCreatedHandler).toHaveBeenCalledWith(createdEvent);
    expect(spyUpdatedHandler).toHaveBeenCalledWith(updatedEvent);
});
