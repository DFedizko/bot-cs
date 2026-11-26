import { definePort } from "../define-port";

const KEYBOARD_SHORTCUTS_PORT = "KeyboardShortcuts";

export interface KeyboardShortcuts {
    listen: (key: string, onPress: () => void) => () => void;
}

export const { Provider: KeyboardShortcutsProvider, usePort: useKeyboardShortcuts } =
    definePort<KeyboardShortcuts>(KEYBOARD_SHORTCUTS_PORT);
