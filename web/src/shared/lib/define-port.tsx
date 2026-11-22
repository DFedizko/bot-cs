import { createContext, use } from "react";
import type { ReactNode } from "react";

type PortProviderProps<TPort> = { value: TPort; children: ReactNode };

export function definePort<TPort>(name: string) {
    const PortContext = createContext<TPort | null>(null);

    function Provider({ value, children }: PortProviderProps<TPort>) {
        return <PortContext value={value}>{children}</PortContext>;
    }

    function usePort(): TPort {
        const port = use(PortContext);
        if (port === null) throw new Error(`No implementation is bound to the port "${name}"`);
        return port;
    }

    return { Provider, usePort };
}
