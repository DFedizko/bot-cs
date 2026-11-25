import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createMemoryStoreFactory } from "@/shared/adapters/create-memory-store-factory";
import { HttpClientProvider } from "@/shared/lib/http/http-client";
import type { HttpClient } from "@/shared/lib/http/http-client";
import { StoreFactoryProvider } from "@/shared/lib/store/store-factory";

export type AppDependencies = {
    queryClient: QueryClient;
    httpClient: HttpClient;
};

type AppProvidersProps = AppDependencies & { children: ReactNode };

const storeFactory = createMemoryStoreFactory();

export function AppProviders({ queryClient, httpClient, children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <HttpClientProvider value={httpClient}>
                <StoreFactoryProvider value={storeFactory}>{children}</StoreFactoryProvider>
            </HttpClientProvider>
        </QueryClientProvider>
    );
}
