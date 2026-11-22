import { describe, expect, it } from "bun:test";
import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { App } from "./app";
import { APP_NAME } from "./app-name";
import { createQueryClient } from "./query-client";
import { createAppRouter } from "./router";

const HOME_PATH = "/";

const renderAt = (path: string) => {
    const queryClient = createQueryClient();
    const history = createMemoryHistory({ initialEntries: [path] });
    render(<App router={createAppRouter({ queryClient, history })} queryClient={queryClient} />);
};

describe("App", () => {
    it("Should render the home page at the root path", async () => {
        renderAt(HOME_PATH);

        expect(await screen.findByRole("heading", { name: APP_NAME })).toBeInTheDocument();
    });
});
