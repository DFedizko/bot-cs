import { useState } from "react";
import type { Store } from "@/shared/lib/store/store";
import { useStoreFactory } from "@/shared/lib/store/store-factory";

export function useInstanceStore<TState>(initialState: TState): Store<TState> {
    const createStore = useStoreFactory();
    const [store] = useState(() => createStore(initialState));
    return store;
}
