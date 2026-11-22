import { describe, expect, it, jest } from "bun:test";
import { createMemoryStore } from "@/shared/adapters/create-memory-store";

type Counter = { count: number };

const INITIAL: Counter = { count: 0 };
const increment = (state: Counter): Counter => ({ count: state.count + 1 });

describe("createMemoryStore", () => {
    it("Should start with the initial state", () => {
        const store = createMemoryStore(INITIAL);

        expect(store.getState()).toEqual(INITIAL);
    });

    it("Should replace the state with the update's result", () => {
        const store = createMemoryStore(INITIAL);

        store.setState(increment);

        expect(store.getState()).toEqual({ count: 1 });
    });

    it("Should notify subscribers when the state changes", () => {
        const store = createMemoryStore(INITIAL);
        const listener = jest.fn();
        store.subscribe(listener);

        store.setState(increment);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("Should stop notifying a subscriber after it unsubscribes", () => {
        const store = createMemoryStore(INITIAL);
        const listener = jest.fn();
        const unsubscribe = store.subscribe(listener);
        unsubscribe();

        store.setState(increment);

        expect(listener).not.toHaveBeenCalled();
    });
});
