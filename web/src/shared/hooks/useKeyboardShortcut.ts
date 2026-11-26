import { useEffect } from "react";
import { useKeyboardShortcuts } from "@/shared/lib/keyboard/keyboard-shortcuts";

export function useKeyboardShortcut(key: string, onPress: () => void) {
    const shortcuts = useKeyboardShortcuts();
    useEffect(() => shortcuts.listen(key, onPress), [shortcuts, key, onPress]);
}
