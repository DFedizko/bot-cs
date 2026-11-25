import { RouterProvider } from "@tanstack/react-router";
import { Devtools } from "@/shared/adapters/devtools";
import type { createAppRouter } from "@/shared/adapters/create-app-router";
import { AppProviders } from "./app-providers";
import type { AppDependencies } from "./app-providers";

type AppProps = AppDependencies & {
    router: ReturnType<typeof createAppRouter>;
};

export function App({ router, queryClient, httpClient }: AppProps) {
    return (
        <AppProviders queryClient={queryClient} httpClient={httpClient}>
            <RouterProvider router={router} />
            <Devtools router={router} />
        </AppProviders>
    );
}
