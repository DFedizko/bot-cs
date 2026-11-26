import { useEffect, useEffectEvent } from "react";
import { useKeyboardShortcuts } from "@/shared/lib/keyboard/keyboard-shortcuts";

export function useKeyboardShortcut(key: string, onPress: () => void) {
    const shortcuts = useKeyboardShortcuts();
    const press = useEffectEvent(onPress);
    useEffect(() => shortcuts.listen(key, () => press()), [shortcuts, key]);
}
