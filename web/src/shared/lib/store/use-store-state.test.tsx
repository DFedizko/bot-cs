import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { createMemoryStore } from "./store.memory";
import { useStoreState } from "./use-store-state";

type Filters = { search: string; page: number };

const INITIAL: Filters = { search: "", page: 1 };
const SEARCH = "AK-47";

const selectSearch = (state: Filters) => state.search;

describe("useStoreState", () => {
    it("Should return the selected slice of the state", () => {
        const store = createMemoryStore(INITIAL);

        const { result } = renderHook(() => useStoreState(store, selectSearch));

        expect(result.current).toBe(INITIAL.search);
    });

    it("Should re-render with the new slice when the store changes", () => {
        const store = createMemoryStore(INITIAL);
        const { result } = renderHook(() => useStoreState(store, selectSearch));

        act(() => store.setState((state) => ({ ...state, search: SEARCH })));

        expect(result.current).toBe(SEARCH);
    });
});
