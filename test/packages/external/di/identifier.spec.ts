import { identifier } from "@/packages/external/di/identifier";

const DESCRIPTION = "Logger";

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
});
