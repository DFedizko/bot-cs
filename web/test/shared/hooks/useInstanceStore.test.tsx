import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { createMemoryStoreFactory } from "@/shared/adapters/create-memory-store-factory";
import { useInstanceStore } from "@/shared/hooks/useInstanceStore";
import { StoreFactoryProvider } from "@/shared/lib/store/store-factory";

type Tile = { failed: boolean };

const LOADED: Tile = { failed: false };
const markFailed = (): Tile => ({ failed: true });

const wrapper = ({ children }: { children: ReactNode }) => (
    <StoreFactoryProvider value={createMemoryStoreFactory()}>{children}</StoreFactoryProvider>
);

describe("useInstanceStore", () => {
    it("Should create a store with the initial state", () => {
        const { result } = renderHook(() => useInstanceStore(LOADED), { wrapper });

        expect(result.current.getState()).toEqual(LOADED);
    });

    it("Should keep the same store across renders of one instance", () => {
        const { result, rerender } = renderHook(() => useInstanceStore(LOADED), { wrapper });
        const firstStore = result.current;

        rerender();

        expect(result.current).toBe(firstStore);
    });

    it("Should give each mounted instance its own store", () => {
        const first = renderHook(() => useInstanceStore(LOADED), { wrapper });
        const second = renderHook(() => useInstanceStore(LOADED), { wrapper });

        act(() => first.result.current.setState(markFailed));

        expect(second.result.current.getState()).toEqual(LOADED);
    });

    it("Should fail naming the port when no store factory is bound", () => {
        const renderUnbound = () => renderHook(() => useInstanceStore(LOADED));

        expect(renderUnbound).toThrow("StoreFactory");
    });
});
