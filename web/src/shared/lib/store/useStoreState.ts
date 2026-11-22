import { useSyncExternalStore } from "react";
import type { Store } from "./store";

export function useStoreState<TState, TSlice>(store: Store<TState>, select: (state: TState) => TSlice): TSlice {
    return useSyncExternalStore(store.subscribe, () => select(store.getState()));
}
