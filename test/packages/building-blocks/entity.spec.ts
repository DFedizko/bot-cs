import { FooEntity } from "./__mocks__/foo.entity";
import { FooId } from "./__mocks__/FooId";

const ID = "0b7e3a52-3c1f-4c55-9d8e-2f5b6c1a7d90";
const OTHER_ID = "5f1d2c7e-8a4b-4e6f-9c3d-1b2a3e4f5d6c";

describe("Entity", () => {
    it("Should equal an entity whose id has the same value", () => {
        const entity = new FooEntity(FooId.restore(ID));

        const equal = entity.equals(new FooEntity(FooId.restore(ID)));

        expect(equal).toBe(true);
    });

    it("Should not equal an entity with another id", () => {
        const entity = new FooEntity(FooId.restore(ID));

        const equal = entity.equals(new FooEntity(FooId.restore(OTHER_ID)));

        expect(equal).toBe(false);
    });

    it("Should not equal nothing", () => {
        const entity = new FooEntity(FooId.restore(ID));

        const equal = entity.equals(undefined as unknown as FooEntity);

        expect(equal).toBe(false);
    });
});
