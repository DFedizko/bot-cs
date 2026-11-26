import { describe, expect, it, jest } from "bun:test";
import { renderHook } from "@testing-library/react";
import { createAppWrapper } from "@/__builders__/create-app-wrapper";
import { useKeyboardShortcut } from "@/shared/hooks/useKeyboardShortcut";

const press = (key: string, modifiers: KeyboardEventInit) =>
    window.dispatchEvent(new KeyboardEvent("keydown", { key, cancelable: true, ...modifiers }));

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
});
