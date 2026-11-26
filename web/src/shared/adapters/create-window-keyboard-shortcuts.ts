import type { KeyboardShortcuts } from "@/shared/lib/keyboard/keyboard-shortcuts";

const KEYDOWN = "keydown";

const matches = (key: string, event: KeyboardEvent) =>
    event.key.toLowerCase() === key.toLowerCase() && (event.metaKey || event.ctrlKey);

export function createWindowKeyboardShortcuts(target: Window = window): KeyboardShortcuts {
    return {
        listen: (key, onPress) => {
            const pressShortcut = (event: KeyboardEvent) => {
                if (!matches(key, event)) return;
                event.preventDefault();
                onPress();
            };
            target.addEventListener(KEYDOWN, pressShortcut);
            return () => target.removeEventListener(KEYDOWN, pressShortcut);
        },
    };
}
