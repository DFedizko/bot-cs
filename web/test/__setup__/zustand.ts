import { afterEach, mock } from "bun:test";
import type { StateCreator } from "zustand";

const actual = await import("zustand");
const createActual = actual.create;
const resets = new Set<() => void>();

const createResettable = <TState>(initializer: StateCreator<TState>) => {
    const useStore = createActual(initializer);
    const initialState = useStore.getInitialState();
    resets.add(() => useStore.setState(initialState, true));
    return useStore;
};

const create = <TState>(initializer?: StateCreator<TState>) =>
    initializer ? createResettable(initializer) : createResettable;

mock.module("zustand", () => ({ ...actual, create }));

afterEach(() => resets.forEach((reset) => reset()));
