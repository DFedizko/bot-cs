import { describe, expect, it } from "bun:test";
import { screen } from "@testing-library/react";
import { renderApp } from "@/__builders__/render-app";
import { APP_NAME } from "@/shared/lib/app-name";

const HOME_PATH = "/";

describe("App", () => {
    it("Should render the home page at the root path", async () => {
        renderApp(HOME_PATH);

        expect(await screen.findByRole("heading", { name: APP_NAME })).toBeInTheDocument();
    });
});
