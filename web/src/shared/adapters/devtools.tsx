import type { AnyRouter } from "@tanstack/react-router";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { SHOW_DEVTOOLS } from "./show-devtools";

const DEVTOOLS_CONFIG = { position: "bottom-right" } as const;

type DevtoolsProps = { router: AnyRouter };

export function Devtools({ router }: DevtoolsProps) {
    if (!SHOW_DEVTOOLS) return null;
    return (
        <TanStackDevtools
            config={DEVTOOLS_CONFIG}
            plugins={[
                { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel router={router} /> },
                { name: "TanStack Query", render: <ReactQueryDevtoolsPanel /> },
            ]}
        />
    );
}
