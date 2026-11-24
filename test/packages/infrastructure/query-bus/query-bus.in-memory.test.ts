import { FooQuery, type FooResponse } from "@/packages/building-blocks/__mocks__/foo.query";
import { FooQueryHandler } from "@/packages/building-blocks/__mocks__/foo.query-handler";
import { QueryBusInMemory } from "@/packages/infrastructure/query-bus/query-bus.in-memory";
import { QueryNotRegisteredError } from "@/packages/error/query-not-registered.error";

const FOO_ID = "foo-1";

describe("QueryBusInMemory", () => {
    it("Should answer with the response of the registered handler", async () => {
        const queryBus = new QueryBusInMemory();
        queryBus.register(new FooQueryHandler());

        const response = await queryBus.ask(new FooQuery(FOO_ID));

        expect(response).toEqual({ foo: FOO_ID });
    });

    it("Should pass the query to its handler", async () => {
        const queryBus = new QueryBusInMemory();
        const handler = new FooQueryHandler();
        const handleSpy = jest.spyOn(handler, "handle");
        queryBus.register(handler);
        const query = new FooQuery(FOO_ID);

        await queryBus.ask(query);

        expect(handleSpy).toHaveBeenCalledWith(query);
    });

    it("Should reject a query with no registered handler", async () => {
        const queryBus = new QueryBusInMemory();

        const answer = queryBus.ask(new FooQuery(FOO_ID));

        await expect(answer).rejects.toBeInstanceOf(QueryNotRegisteredError);
    });

    it("Should infer the response type from the query", () => {
        const queryBus = new QueryBusInMemory();

        const answer = () => queryBus.ask(new FooQuery(FOO_ID));

        expectTypeOf(answer).returns.resolves.toEqualTypeOf<FooResponse>();
    });
});
