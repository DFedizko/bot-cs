import { FooQuery } from "./__mocks__/foo.query";

const FOO_ID = "foo-1";

describe("Query", () => {
    it("Should take its name from the query class", () => {
        const query = new FooQuery(FOO_ID);

        expect(query.name).toBe(FooQuery.QUERY_NAME);
    });

    it("Should keep its typed fields", () => {
        const query = new FooQuery(FOO_ID);

        expect(query.fooId).toBe(FOO_ID);
    });
});
