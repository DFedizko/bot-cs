import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import type { createAppRouter } from "./create-app-router";

type AppProps = {
    router: ReturnType<typeof createAppRouter>;
    queryClient: QueryClient;
};

export function App({ router, queryClient }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}
