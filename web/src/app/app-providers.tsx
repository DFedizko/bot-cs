import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { AccountsHttpService, AccountsServiceProvider } from "@/features/accounts";
import { createMemoryStoreFactory } from "@/shared/adapters/create-memory-store-factory";
import { readSidebarCookie } from "@/shared/adapters/read-sidebar-cookie";
import { HttpClientProvider } from "@/shared/lib/http/http-client";
import type { HttpClient } from "@/shared/lib/http/http-client";
import { SidebarPreferenceProvider } from "@/shared/lib/sidebar/sidebar-preference";
import { StoreFactoryProvider } from "@/shared/lib/store/store-factory";

export type AppDependencies = {
    queryClient: QueryClient;
    httpClient: HttpClient;
};

type AppProvidersProps = AppDependencies & { children: ReactNode };

const storeFactory = createMemoryStoreFactory();
const sidebarPreference = { readOpen: () => readSidebarCookie() };

export function AppProviders({ queryClient, httpClient, children }: AppProvidersProps) {
    const [accountsService] = useState(() => new AccountsHttpService(httpClient));
    return (
        <QueryClientProvider client={queryClient}>
            <HttpClientProvider value={httpClient}>
                <StoreFactoryProvider value={storeFactory}>
                    <SidebarPreferenceProvider value={sidebarPreference}>
                        <AccountsServiceProvider value={accountsService}>{children}</AccountsServiceProvider>
                    </SidebarPreferenceProvider>
                </StoreFactoryProvider>
            </HttpClientProvider>
        </QueryClientProvider>
    );
}
