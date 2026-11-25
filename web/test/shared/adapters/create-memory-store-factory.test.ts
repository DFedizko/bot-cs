import { describe, expect, it } from "bun:test";
import { createMemoryStoreFactory } from "@/shared/adapters/create-memory-store-factory";

type Menu = { open: boolean };

const CLOSED: Menu = { open: false };
const openMenu = (): Menu => ({ open: true });

describe("createMemoryStoreFactory", () => {
    it("Should create a store that starts with the given state", () => {
        const createStore = createMemoryStoreFactory();

        const store = createStore(CLOSED);

        expect(store.getState()).toEqual(CLOSED);
    });

    it("Should create stores that never share their state", () => {
        const createStore = createMemoryStoreFactory();
        const first = createStore(CLOSED);
        const second = createStore(CLOSED);

        first.setState(openMenu);

        expect(second.getState()).toEqual(CLOSED);
    });
});
