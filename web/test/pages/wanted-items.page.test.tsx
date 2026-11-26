import { describe, expect, it } from "bun:test";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "@/__builders__/render-app";
import { mockBotApiMock } from "@/__mocks__/mock-bot-api.mock";
import { mswServer } from "@/__setup__/msw-server";
import { createMockWantedItems } from "@/shared/adapters/mock-bot-api/create-mock-wanted-items";
import { listWantedItemsFailureMock } from "@/features/wanted-items/__mocks__/list-wanted-items-failure.mock";
import { findItems, itemNames, renderWantedItems } from "./__builders__/render-wanted-items";

const NEWEST_ITEM = "AWP | Asiimov (Factory New)";
const PAUSED_ITEM = "AK-47 | Redline (Factory New)";
const OTHER_ITEM = "★ Karambit | Doppler (Factory New)";
const UNKNOWN_ITEM = "Sticker | Titan (Holo) | Katowice 2014";
const FIRST_BY_NAME = "★ Karambit | Doppler (Battle-Scarred)";
const PAGE_SIZE = 18;
const SIZED_IMAGE = /\/256fx256f$/;
const MAIN_ACCOUNT_ID = "6528461";
const ALT_ACCOUNT_ID = "7104022";
const SLOW_API_MS = 100;

const itemCard = (name: string) => screen.getByRole("article", { name });

describe("WantedItemsPage", () => {
    it("Should show the first page of wanted items as cards", async () => {
        await renderWantedItems();

        expect(await findItems()).toHaveLength(PAGE_SIZE);
    });

    it("Should show each item's rarity, weapon, skin, wear and max", async () => {
        await renderWantedItems();

        expect(itemCard(NEWEST_ITEM)).toHaveTextContent(/Covert.*AWP.*Asiimov.*Factory New.*Max.*−3%/);
    });

    it("Should ask Steam for a picture the size of the card, loaded lazily", async () => {
        await renderWantedItems();

        const picture = within(itemCard(NEWEST_ITEM)).getByRole("presentation");

        expect(picture).toHaveAttribute("src", expect.stringMatching(SIZED_IMAGE));
        expect(picture).toHaveAttribute("loading", "lazy");
    });

    it("Should show a neutral tile when a picture fails to load", async () => {
        await renderWantedItems();

        fireEvent.error(within(itemCard(NEWEST_ITEM)).getByRole("presentation"));

        expect(within(itemCard(NEWEST_ITEM)).queryByRole("presentation")).not.toBeInTheDocument();
    });

    it("Should keep the other pictures when one fails to load", async () => {
        await renderWantedItems();

        fireEvent.error(within(itemCard(NEWEST_ITEM)).getByRole("presentation"));

        expect(within(itemCard(OTHER_ITEM)).getByRole("presentation")).toBeInTheDocument();
    });

    it("Should mark a paused item", async () => {
        await renderWantedItems();

        expect(itemCard(PAUSED_ITEM)).toHaveTextContent("Paused");
        expect(within(itemCard(PAUSED_ITEM)).getByRole("switch")).not.toBeChecked();
    });

    it("Should show an item the catalog doesn't know by its market name, without a picture", async () => {
        await renderWantedItems();

        expect(itemCard(UNKNOWN_ITEM)).toHaveTextContent("No catalog data");
        expect(within(itemCard(UNKNOWN_ITEM)).queryByRole("presentation")).not.toBeInTheDocument();
    });

    it("Should say how many items the bot bids on", async () => {
        await renderWantedItems();

        expect(screen.getByText(/Bot is bidding on/)).toHaveTextContent("Bot is bidding on 41 of 47 items");
    });

    it.each([
        ["All", "47"],
        ["Active", "41"],
        ["Paused", "6"],
    ])("Should count the %s items", async (filter, count) => {
        await renderWantedItems();

        expect(screen.getByRole("button", { name: new RegExp(`^${filter}`) })).toHaveTextContent(count);
    });

    it("Should list only the paused items and keep the filter in the URL", async () => {
        const user = userEvent.setup();
        const { router } = await renderWantedItems();

        await user.click(screen.getByRole("button", { name: /^Paused/ }));

        await waitFor(async () => expect(await findItems()).toHaveLength(6));
        expect(router.state.location.search).toMatchObject({ filter: "paused" });
    });

    it("Should open with the filter a link carries", async () => {
        await renderWantedItems("?filter=active");

        expect(screen.getByRole("button", { name: /^Active/ })).toHaveAttribute("aria-pressed", "true");
    });

    it("Should sort by name and keep the order in the URL", async () => {
        const user = userEvent.setup();
        const { router } = await renderWantedItems();

        await user.click(screen.getByRole("button", { name: /Sort: Most recent/ }));
        await user.click(await screen.findByRole("menuitemradio", { name: /Name A → Z/ }));

        await waitFor(async () => expect((await itemNames())[0]).toBe(FIRST_BY_NAME));
        expect(router.state.location.search).toMatchObject({ sort: "name-asc" });
    });

    it("Should show the next page and keep it in the URL", async () => {
        const user = userEvent.setup();
        const { router } = await renderWantedItems();

        await user.click(screen.getByRole("button", { name: "Next page" }));

        expect(await screen.findByText("Showing 19–36 of 47 items")).toBeInTheDocument();
        expect(router.state.location.search).toMatchObject({ page: 2 });
    });

    it("Should open the page a link carries", async () => {
        await renderWantedItems("?page=3");

        expect(await screen.findByText("Showing 37–47 of 47 items")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
    });

    it("Should show more items per page", async () => {
        const user = userEvent.setup();
        const { router } = await renderWantedItems();

        await user.click(screen.getByRole("combobox", { name: "Items per page" }));
        await user.click(await screen.findByRole("option", { name: "36" }));

        await waitFor(async () => expect(await findItems()).toHaveLength(36));
        expect(router.state.location.search).toMatchObject({ pageSize: 36 });
    });

    it("Should show the items as rows in the list view", async () => {
        const user = userEvent.setup();
        const { router } = await renderWantedItems();

        await user.click(screen.getByRole("button", { name: "List view" }));

        expect(screen.getByRole("button", { name: "List view" })).toHaveAttribute("aria-pressed", "true");
        expect(itemCard(NEWEST_ITEM)).toHaveTextContent(/AWP \| Asiimov.*Covert.*Factory New.*−3%/);
        expect(router.state.location.search).toMatchObject({ view: "list" });
    });

    it("Should offer each item's actions in its menu", async () => {
        const user = userEvent.setup();
        await renderWantedItems();

        await user.click(within(itemCard(NEWEST_ITEM)).getByRole("button", { name: `Actions for ${NEWEST_ITEM}` }));

        expect(await screen.findByRole("menuitem", { name: "Edit" })).toHaveAttribute("aria-disabled", "true");
    });

    it("Should invite to add an item when the account wants nothing yet", async () => {
        mswServer.use(...mockBotApiMock());

        renderApp("/accounts/7104022/wanted-items");

        expect(await screen.findByRole("heading", { name: "No wanted items yet" })).toBeInTheDocument();
    });

    it.each([
        ["meta", "Press ⌘K to add one"],
        ["ctrl", "Press Ctrl K to add one"],
    ] as const)("Should hint the %s search shortcut when the account wants nothing", async (shortcutModifier, hint) => {
        mswServer.use(...mockBotApiMock());

        renderApp(`/accounts/${ALT_ACCOUNT_ID}/wanted-items`, { shortcutModifier });

        expect(await screen.findByText(/to add one/)).toHaveTextContent(hint);
    });

    it("Should say when the wanted items can't be loaded, and retry", async () => {
        mswServer.use(listWantedItemsFailureMock(), ...mockBotApiMock());
        renderApp("/accounts/6528461/wanted-items");

        expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load your wanted items");
        expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    });

    it("Should never show the previous account's items while another account loads", async () => {
        const user = userEvent.setup();
        const [altItem] = createMockWantedItems().slice(-1);
        const wantedItems = { [MAIN_ACCOUNT_ID]: createMockWantedItems(), [ALT_ACCOUNT_ID]: [altItem] };
        mswServer.use(...mockBotApiMock({ wantedItems, latencyMs: SLOW_API_MS }));
        renderApp(`/accounts/${MAIN_ACCOUNT_ID}/wanted-items`);
        await user.click(await screen.findByRole("button", { name: /Switch account/ }));

        await user.click(await screen.findByRole("menuitem", { name: /Empire alt/ }));

        await screen.findByRole("button", { name: "Switch account, Empire alt" });
        expect(screen.queryByRole("article", { name: NEWEST_ITEM })).not.toBeInTheDocument();
        expect(await screen.findByRole("article", { name: altItem.name })).toBeInTheDocument();
    });
});
