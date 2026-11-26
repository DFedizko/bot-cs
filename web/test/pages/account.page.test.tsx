import { describe, expect, it } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "@/__builders__/render-app";
import type { TestAppOptions } from "@/__builders__/test-app-options";
import { mockBotApiMock } from "@/__mocks__/mock-bot-api.mock";
import { mswServer } from "@/__setup__/msw-server";

const MAIN_PATH = "/accounts/6528461/wanted-items";
const DISABLED_PAGES = ["Dashboard", "Auctions", "Deliveries", "Balance", "Settings"];
const NAV_ITEMS = ["Dashboard", "Wanted items", "Auctions", "Deliveries", "Balance", "Settings"];
const TOGGLE = { name: "Toggle sidebar" };

const MAIN_NAVIGATION = { name: "Main" };

const isHiddenFromUser = (element: HTMLElement) => element.closest('[aria-hidden="true"]') !== null;

const isLabelHidden = (label: string) =>
    isHiddenFromUser(within(screen.getByRole("navigation", MAIN_NAVIGATION)).getByText(label));

const renderShell = async (options: TestAppOptions = {}) => {
    mswServer.use(...mockBotApiMock());
    renderApp(MAIN_PATH, options);
    return screen.findByRole("button", { name: /Switch account/ });
};

describe("AccountPage", () => {
    it("Should link to the wanted items as the current page", async () => {
        await renderShell();

        expect(screen.getByRole("link", { name: "Wanted items" })).toHaveAttribute("aria-current", "page");
    });

    it.each(DISABLED_PAGES)("Should show %s as a page that doesn't exist yet", async (name) => {
        await renderShell();

        expect(screen.getByRole("button", { name })).toHaveAttribute("aria-disabled", "true");
    });

    it("Should show the account's name, CSGOEmpire id and coin balance", async () => {
        const accountChip = await renderShell();

        expect(accountChip).toHaveTextContent(/Empire main\s*#6528461\s*12,480\.36/);
    });

    it("Should switch to another account's wanted items from the account menu", async () => {
        const user = userEvent.setup();
        await user.click(await renderShell());

        await user.click(await screen.findByRole("menuitem", { name: /Empire alt/ }));

        await waitFor(() =>
            expect(screen.getByRole("button", { name: /Switch account/ })).toHaveTextContent("Empire alt"),
        );
    });

    it("Should collapse the sidebar to icons that keep their names", async () => {
        const user = userEvent.setup();
        await renderShell();

        await user.click(screen.getByRole("button", TOGGLE));

        expect(screen.getByRole("button", TOGGLE)).toHaveAttribute("aria-expanded", "false");
        expect(NAV_ITEMS.every(isLabelHidden)).toBe(true);
        expect(screen.getByRole("link", { name: "Wanted items" })).toBeInTheDocument();
    });

    it("Should expand the collapsed sidebar again", async () => {
        const user = userEvent.setup();
        await renderShell();
        await user.click(screen.getByRole("button", TOGGLE));

        await user.click(screen.getByRole("button", TOGGLE));

        expect(screen.getByRole("button", TOGGLE)).toHaveAttribute("aria-expanded", "true");
        expect(isLabelHidden("Dashboard")).toBe(false);
    });

    it("Should start collapsed when the sidebar was collapsed before the reload", async () => {
        document.cookie = "sidebar_state=false; path=/";
        await renderShell();

        expect(screen.getByRole("button", TOGGLE)).toHaveAttribute("aria-expanded", "false");
    });

    it("Should show the search in the top bar", async () => {
        await renderShell();

        expect(screen.getByRole("button", { name: /Search any item/ })).toBeInTheDocument();
    });

    it("Should open the item search from the top bar", async () => {
        const user = userEvent.setup();
        await renderShell();

        await user.click(screen.getByRole("button", { name: /Search any item/ }));

        expect(await screen.findByRole("dialog", { name: "Search any item" })).toBeInTheDocument();
    });

    it("Should open the item search with ⌘K", async () => {
        const user = userEvent.setup();
        await renderShell();

        await user.keyboard("{Meta>}k{/Meta}");

        expect(await screen.findByRole("combobox", { name: "Search any item" })).toHaveFocus();
    });

    it("Should open the item search with Ctrl K", async () => {
        const user = userEvent.setup();
        await renderShell();

        await user.keyboard("{Control>}k{/Control}");

        expect(await screen.findByRole("combobox", { name: "Search any item" })).toBeInTheDocument();
    });

    it.each([
        ["meta", "⌘K", "Meta+K"],
        ["ctrl", "Ctrl K", "Control+K"],
    ] as const)("Should show the %s search shortcut as %s", async (shortcutModifier, hint, ariaShortcut) => {
        await renderShell({ shortcutModifier });

        const search = screen.getByRole("button", { name: /Search any item/ });

        expect(search).toHaveTextContent(hint);
        expect(search).toHaveAttribute("aria-keyshortcuts", ariaShortcut);
    });

    it.each([
        ["meta", "⌘B"],
        ["ctrl", "Ctrl B"],
    ] as const)("Should show the %s sidebar shortcut as %s", async (shortcutModifier, hint) => {
        const user = userEvent.setup();
        await renderShell({ shortcutModifier });

        await user.hover(screen.getByRole("button", TOGGLE));

        expect(await screen.findByText(hint)).toBeInTheDocument();
    });
});
