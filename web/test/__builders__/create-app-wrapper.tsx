import { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AppProviders } from "@/app/app-providers";
import { HttpClientAxiosAdapter } from "@/shared/adapters/axios/http-client.axios-adapter";
import { TEST_BOT_API_URL } from "./test-bot-api-url";
import { TEST_QUERY_OPTIONS } from "./test-query-options";

export function createAppWrapper() {
    const queryClient = new QueryClient({ defaultOptions: TEST_QUERY_OPTIONS });
    const httpClient = new HttpClientAxiosAdapter(TEST_BOT_API_URL);
    return ({ children }: { children: ReactNode }) => (
        <AppProviders queryClient={queryClient} httpClient={httpClient}>
            {children}
        </AppProviders>
    );
}
