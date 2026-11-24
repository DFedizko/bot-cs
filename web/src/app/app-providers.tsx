import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { HttpClientProvider } from "@/shared/lib/http/http-client";
import type { HttpClient } from "@/shared/lib/http/http-client";

export type AppDependencies = {
    queryClient: QueryClient;
    httpClient: HttpClient;
};

type AppProvidersProps = AppDependencies & { children: ReactNode };

export function AppProviders({ queryClient, httpClient, children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <HttpClientProvider value={httpClient}>{children}</HttpClientProvider>
        </QueryClientProvider>
    );
}
