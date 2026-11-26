import { RouterProvider } from "@tanstack/react-router";
import { Devtools } from "@/shared/adapters/devtools";
import type { createAppRouter } from "@/shared/adapters/create-app-router";
import { AppProviders } from "./app-providers";
import type { AppDependencies } from "./app-providers";

type AppProps = AppDependencies & {
    router: ReturnType<typeof createAppRouter>;
};

export function App({ router, ...dependencies }: AppProps) {
    return (
        <AppProviders {...dependencies}>
            <RouterProvider router={router} />
            <Devtools router={router} />
        </AppProviders>
    );
}
