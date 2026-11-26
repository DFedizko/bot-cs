import { describe, expect, it } from "bun:test";
import { createMockWantedItems } from "@/shared/adapters/mock-bot-api/create-mock-wanted-items";

const ITEM_COUNT = 47;
const PAUSED_COUNT = 6;

describe("createMockWantedItems", () => {
    it("Should fill an account with 47 wanted items", () => {
        expect(createMockWantedItems()).toHaveLength(ITEM_COUNT);
    });

    it("Should give every item its own market name", () => {
        const names = new Set(createMockWantedItems().map(({ name }) => name));

        expect(names.size).toBe(ITEM_COUNT);
    });

    it("Should pause six of them", () => {
        const paused = createMockWantedItems().filter(({ enabled }) => !enabled);

        expect(paused).toHaveLength(PAUSED_COUNT);
    });

    it("Should keep an item the catalog doesn't know", () => {
        const unknown = createMockWantedItems().filter(({ catalog }) => catalog === null);

        expect(unknown.length).toBeGreaterThan(0);
    });
});
