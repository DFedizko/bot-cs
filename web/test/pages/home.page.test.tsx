import { describe, expect, it } from "bun:test";
import { screen } from "@testing-library/react";
import { renderApp } from "@/__builders__/render-app";
import { mockBotApiMock } from "@/__mocks__/mock-bot-api.mock";
import { mswServer } from "@/__setup__/msw-server";
import { listAccountsFailureMock } from "@/features/accounts/__mocks__/list-accounts-failure.mock";

const HOME_PATH = "/";

describe("HomePage", () => {
    it("Should open the first account's wanted items", async () => {
        mswServer.use(...mockBotApiMock());

        renderApp(HOME_PATH);

        expect(await screen.findByRole("heading", { name: "Wanted items" })).toBeInTheDocument();
    });

    it("Should say when the bot trades for no account", async () => {
        mswServer.use(...mockBotApiMock({ accounts: [] }));

        renderApp(HOME_PATH);

        expect(await screen.findByText("The bot has no CSGOEmpire account yet")).toBeInTheDocument();
    });

    it("Should say when the accounts can't be loaded", async () => {
        mswServer.use(listAccountsFailureMock());

        renderApp(HOME_PATH);

        expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't reach the bot");
    });
});
