import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { App } from "@/app/app";
import { createAppRouter } from "@/shared/adapters/create-app-router";
import { HttpClientAxiosAdapter } from "@/shared/adapters/http-client.axios-adapter";
import { TEST_BOT_API_URL } from "./test-bot-api-url";

const TEST_QUERY_OPTIONS = { queries: { retry: false }, mutations: { retry: false } };

export function renderApp(path: string) {
    const queryClient = new QueryClient({ defaultOptions: TEST_QUERY_OPTIONS });
    const httpClient = new HttpClientAxiosAdapter(TEST_BOT_API_URL);
    const history = createMemoryHistory({ initialEntries: [path] });
    return render(
        <App router={createAppRouter({ queryClient, history })} queryClient={queryClient} httpClient={httpClient} />,
    );
}
