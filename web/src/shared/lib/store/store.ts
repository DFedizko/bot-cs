export type StateUpdate<TState> = (state: TState) => TState;

export type StoreListener = () => void;

export interface Store<TState> {
    getState: () => TState;
    setState: (update: StateUpdate<TState>) => void;
    subscribe: (listener: StoreListener) => () => void;
}
