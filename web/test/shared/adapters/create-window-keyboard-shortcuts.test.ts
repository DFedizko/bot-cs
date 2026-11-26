import { describe, expect, it, jest } from "bun:test";
import { createWindowKeyboardShortcuts } from "@/shared/adapters/create-window-keyboard-shortcuts";

const press = (key: string, modifiers: KeyboardEventInit = {}) =>
    window.dispatchEvent(new KeyboardEvent("keydown", { key, cancelable: true, ...modifiers }));

describe("createWindowKeyboardShortcuts", () => {
    it("Should call back on ⌘ and the key", () => {
        const onPress = jest.fn();
        const stop = createWindowKeyboardShortcuts().listen("k", onPress);

        press("k", { metaKey: true });

        expect(onPress).toHaveBeenCalledTimes(1);
        stop();
    });

    it("Should call back on Ctrl and the key, whatever its case", () => {
        const onPress = jest.fn();
        const stop = createWindowKeyboardShortcuts().listen("k", onPress);

        press("K", { ctrlKey: true });

        expect(onPress).toHaveBeenCalledTimes(1);
        stop();
    });

    it("Should ignore the key without a modifier", () => {
        const onPress = jest.fn();
        const stop = createWindowKeyboardShortcuts().listen("k", onPress);

        press("k");

        expect(onPress).not.toHaveBeenCalled();
        stop();
    });

    it("Should stop calling back once stopped", () => {
        const onPress = jest.fn();
        createWindowKeyboardShortcuts().listen("k", onPress)();

        press("k", { metaKey: true });

        expect(onPress).not.toHaveBeenCalled();
    });
});
