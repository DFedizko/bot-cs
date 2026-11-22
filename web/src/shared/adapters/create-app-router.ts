import { createRouter } from "@tanstack/react-router";
import type { RouterHistory } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { routeTree } from "@/routeTree.gen";

type AppRouterOptions = {
    queryClient: QueryClient;
    history?: RouterHistory;
};

export const createAppRouter = ({ queryClient, history }: AppRouterOptions) =>
    createRouter({
        routeTree,
        history,
        context: { queryClient },
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        scrollRestoration: true,
    });

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof createAppRouter>;
    }
}
