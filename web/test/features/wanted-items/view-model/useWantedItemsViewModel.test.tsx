import { afterEach, describe, expect, it, jest } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createAppWrapper } from "@/__builders__/create-app-wrapper";
import { mockBotApiMock } from "@/__mocks__/mock-bot-api.mock";
import { mswServer } from "@/__setup__/msw-server";
import { DEFAULT_WANTED_ITEMS_SEARCH } from "@/features/wanted-items/model/default-wanted-items-search";
import type { WantedItemsSearch } from "@/features/wanted-items/model/wanted-items-search";
import { useWantedItemsViewModel } from "@/features/wanted-items/view-model/useWantedItemsViewModel";
import { captureRequests } from "../__mocks__/capture-requests.mock";
import { listWantedItemsFailureMock } from "../__mocks__/list-wanted-items-failure.mock";
import { toggleWantedItemFailureMock } from "../__mocks__/toggle-wanted-item-failure.mock";

const ACCOUNT_ID = "6528461";
const EMPTY_ACCOUNT_ID = "7104022";
const PAGE_SIZE = 18;

const renderViewModel = (search: Partial<WantedItemsSearch> = {}, accountId = ACCOUNT_ID) => {
    const onSearchChange = jest.fn();
    const rendered = renderHook(
        () =>
            useWantedItemsViewModel({
                accountId,
                search: { ...DEFAULT_WANTED_ITEMS_SEARCH, ...search },
                onSearchChange,
            }),
        { wrapper: createAppWrapper() },
    );
    return { ...rendered, onSearchChange };
};

const renderReady = async (search: Partial<WantedItemsSearch> = {}) => {
    const rendered = renderViewModel(search);
    await waitFor(() => expect(rendered.result.current.status).toBe("ready"));
    return rendered;
};

describe("useWantedItemsViewModel", () => {
    afterEach(() => mswServer.events.removeAllListeners());

    it("Should start loading the wanted items", () => {
        mswServer.use(...mockBotApiMock());

        const { result } = renderViewModel();

        expect(result.current.status).toBe("loading");
    });

    it("Should show the first page of items", async () => {
        mswServer.use(...mockBotApiMock());

        const { result } = await renderReady();

        expect(result.current.items).toHaveLength(PAGE_SIZE);
    });

    it("Should count the items of each filter", async () => {
        mswServer.use(...mockBotApiMock());

        const { result } = await renderReady();

        expect(result.current.filters.map(({ value, count }) => [value, count])).toEqual([
            ["all", 47],
            ["active", 41],
            ["paused", 6],
        ]);
    });

    it("Should say how many items the bot bids on", async () => {
        mswServer.use(...mockBotApiMock());

        const { result } = await renderReady();

        expect(result.current.bidding).toEqual({ enabled: 41, all: 47 });
    });

    it("Should ask the bot for the chosen order", async () => {
        mswServer.use(...mockBotApiMock());
        const requests = captureRequests();

        await renderReady({ sort: "max-desc" });

        expect(requests.at(-1)?.searchParams.toString()).toBe("page=1&pageSize=18&sort=max&order=desc");
    });

    it("Should go back to the first page when the filter changes", async () => {
        mswServer.use(...mockBotApiMock());
        const { result, onSearchChange } = await renderReady({ page: 2 });

        act(() => result.current.selectFilter("paused"));

        expect(onSearchChange).toHaveBeenCalledWith({ ...DEFAULT_WANTED_ITEMS_SEARCH, filter: "paused", page: 1 });
    });

    it("Should move to the last page when the page is past the end", async () => {
        mswServer.use(...mockBotApiMock());

        const { onSearchChange } = await renderReady({ page: 9 });

        expect(onSearchChange).toHaveBeenCalledWith({ ...DEFAULT_WANTED_ITEMS_SEARCH, page: 3 });
    });

    it("Should pause an item at once, before the bot answers", async () => {
        mswServer.use(...mockBotApiMock());
        const { result } = await renderReady();
        const [first] = result.current.items;

        act(() => result.current.toggleItem(first.name, false));

        await waitFor(() => expect(result.current.items[0].enabled).toBe(false));
        expect(result.current.bidding?.enabled).toBe(40);
    });

    it("Should put the item back when the bot fails to pause it", async () => {
        mswServer.use(...mockBotApiMock());
        const { result } = await renderReady();
        const [first] = result.current.items;
        mswServer.use(toggleWantedItemFailureMock());

        act(() => result.current.toggleItem(first.name, false));

        await waitFor(() => expect(result.current.items[0].enabled).toBe(false));
        await waitFor(() => expect(result.current.items[0].enabled).toBe(true));
    });

    it("Should say when the account wants nothing yet", async () => {
        mswServer.use(...mockBotApiMock());

        const { result } = renderViewModel({}, EMPTY_ACCOUNT_ID);

        await waitFor(() => expect(result.current.status).toBe("empty"));
    });

    it("Should fail when the wanted items can't be loaded", async () => {
        mswServer.use(listWantedItemsFailureMock());

        const { result } = renderViewModel();

        await waitFor(() => expect(result.current.status).toBe("error"));
    });
});
