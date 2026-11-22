import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Devtools } from "@/shared/adapters/devtools";
import type { createAppRouter } from "@/shared/adapters/create-app-router";

type AppProps = {
    router: ReturnType<typeof createAppRouter>;
    queryClient: QueryClient;
};

export function App({ router, queryClient }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Devtools router={router} />
        </QueryClientProvider>
    );
}
