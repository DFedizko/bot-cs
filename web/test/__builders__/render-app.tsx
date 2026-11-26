import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { App } from "@/app/app";
import { createAppRouter } from "@/shared/adapters/create-app-router";
import { HttpClientAxiosAdapter } from "@/shared/adapters/axios/http-client.axios-adapter";
import { TEST_BOT_API_URL } from "./test-bot-api-url";
import { TEST_QUERY_OPTIONS } from "./test-query-options";

export function renderApp(path: string) {
    const queryClient = new QueryClient({ defaultOptions: TEST_QUERY_OPTIONS });
    const httpClient = new HttpClientAxiosAdapter(TEST_BOT_API_URL);
    const history = createMemoryHistory({ initialEntries: [path] });
    const router = createAppRouter({ queryClient, history });
    return { ...render(<App router={router} queryClient={queryClient} httpClient={httpClient} />), router };
}
