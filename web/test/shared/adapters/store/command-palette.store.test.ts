import { describe, expect, it } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useCommandPaletteStore } from "@/shared/adapters/store/command-palette.store";

const renderStore = () =>
    renderHook(() => ({
        open: useCommandPaletteStore((state) => state.open),
        setOpen: useCommandPaletteStore((state) => state.setOpen),
        toggleOpen: useCommandPaletteStore((state) => state.toggleOpen),
    }));

describe("useCommandPaletteStore", () => {
    it("Should start closed", () => {
        expect(renderStore().result.current.open).toBe(false);
    });

    it("Should open and close on toggle", () => {
        const { result } = renderStore();

        act(() => result.current.toggleOpen());

        expect(result.current.open).toBe(true);
    });

    it("Should take the state it is given", () => {
        const { result } = renderStore();
        act(() => result.current.toggleOpen());

        act(() => result.current.setOpen(false));

        expect(result.current.open).toBe(false);
    });
});
