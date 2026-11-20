import { Container } from "inversify";
import { identifier } from "@/packages/external/di/identifier";

const DESCRIPTION = "Logger";
const VALUE = 42;

describe("identifier", () => {
    it("Should create a symbol described by its name", () => {
        const created = identifier(DESCRIPTION);

        expect(created.toString()).toBe(`Symbol(${DESCRIPTION})`);
    });

    it("Should create a different symbol on each call", () => {
        const first = identifier(DESCRIPTION);

        const second = identifier(DESCRIPTION);

        expect(first).not.toBe(second);
    });

    it("Should type what the container resolves as the identifier's port", () => {
        const NUMBER = identifier<number>(DESCRIPTION);
        const container = new Container();
        container.bind(NUMBER).toConstantValue(VALUE);

        const resolved = container.get(NUMBER);

        expectTypeOf(resolved).toEqualTypeOf<number>();
    });
});
