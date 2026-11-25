import { definePort } from "../define-port";
import type { Store } from "./store";

const STORE_FACTORY_PORT = "StoreFactory";

export type StoreFactory = <TState>(initialState: TState) => Store<TState>;

export const { Provider: StoreFactoryProvider, usePort: useStoreFactory } =
    definePort<StoreFactory>(STORE_FACTORY_PORT);
