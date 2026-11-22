import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import { App } from "@/app/app";
import { createAppRouter } from "@/app/create-app-router";

const TEST_QUERY_OPTIONS = { queries: { retry: false }, mutations: { retry: false } };

export function renderApp(path: string) {
    const queryClient = new QueryClient({ defaultOptions: TEST_QUERY_OPTIONS });
    const history = createMemoryHistory({ initialEntries: [path] });
    return render(<App router={createAppRouter({ queryClient, history })} queryClient={queryClient} />);
}
