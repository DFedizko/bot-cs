import type { StateUpdate, Store, StoreListener } from "./store";

export function createMemoryStore<TState>(initial: TState): Store<TState> {
    let state = initial;
    const listeners = new Set<StoreListener>();

    const notifyListeners = () => listeners.forEach((listener) => listener());

    return {
        getState: () => state,
        setState: (update: StateUpdate<TState>) => {
            state = update(state);
            notifyListeners();
        },
        subscribe: (listener: StoreListener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
