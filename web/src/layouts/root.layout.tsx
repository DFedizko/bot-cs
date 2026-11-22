import { Outlet } from "@tanstack/react-router";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { SHOW_DEVTOOLS } from "@/app/show-devtools";

const DEVTOOLS_PLUGINS = [
    { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> },
    { name: "TanStack Query", render: <ReactQueryDevtoolsPanel /> },
];

export function RootLayout() {
    return (
        <>
            <Outlet />
            {SHOW_DEVTOOLS && <TanStackDevtools config={{ position: "bottom-right" }} plugins={DEVTOOLS_PLUGINS} />}
        </>
    );
}
