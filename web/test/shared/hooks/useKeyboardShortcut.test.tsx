import { describe, expect, it, jest } from "bun:test";
import { renderHook } from "@testing-library/react";
import { createAppWrapper } from "@/__builders__/create-app-wrapper";
import { useKeyboardShortcut } from "@/shared/hooks/useKeyboardShortcut";

const KEYDOWN = "keydown";

const press = (key: string, modifiers: KeyboardEventInit) =>
    window.dispatchEvent(new KeyboardEvent(KEYDOWN, { key, cancelable: true, ...modifiers }));

describe("useKeyboardShortcut", () => {
    it("Should call back while mounted", () => {
        const onPress = jest.fn();
        renderHook(() => useKeyboardShortcut("k", onPress), { wrapper: createAppWrapper() });

        press("k", { ctrlKey: true });

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("Should stop calling back once unmounted", () => {
        const onPress = jest.fn();
        const { unmount } = renderHook(() => useKeyboardShortcut("k", onPress), { wrapper: createAppWrapper() });
        unmount();

        press("k", { metaKey: true });

        expect(onPress).not.toHaveBeenCalled();
    });

    it("Should call the latest callback without listening again", () => {
        const first = jest.fn();
        const latest = jest.fn();
        const listen = jest.spyOn(window, "addEventListener");
        const { rerender } = renderHook(({ onPress }) => useKeyboardShortcut("k", onPress), {
            wrapper: createAppWrapper(),
            initialProps: { onPress: first },
        });
        rerender({ onPress: latest });

        press("k", { metaKey: true });

        const keydownListeners = listen.mock.calls.filter(([type]) => type === KEYDOWN).length;
        expect([first.mock.calls.length, latest.mock.calls.length, keydownListeners]).toEqual([0, 1, 1]);
        listen.mockRestore();
    });
});
