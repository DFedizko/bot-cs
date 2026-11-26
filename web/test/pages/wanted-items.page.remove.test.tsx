import { afterEach, describe, expect, it } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mswServer } from "@/__setup__/msw-server";
import { removeWantedItemPendingMock } from "@/features/wanted-items/__mocks__/remove-wanted-item-pending.mock";
import { removeWantedItemNotFoundMock } from "@/features/wanted-items/__mocks__/remove-wanted-item-not-found.mock";
import { captureBodies } from "./__builders__/capture-bodies";
import { renderWantedItems } from "./__builders__/render-wanted-items";

const NEWEST_ITEM = "AWP | Asiimov (Factory New)";
const REMOVE_DIALOG = { name: "Remove from wanted items?" };

const openRemoveDialog = async (user: ReturnType<typeof userEvent.setup>) => {
    const card = screen.getByRole("article", { name: NEWEST_ITEM });
    await user.click(within(card).getByRole("button", { name: `Actions for ${NEWEST_ITEM}` }));
    await user.click(await screen.findByRole("menuitem", { name: "Remove" }));
    return screen.findByRole("alertdialog", REMOVE_DIALOG);
};

describe("WantedItemsPage remove", () => {
    afterEach(() => mswServer.events.removeAllListeners());

    it("Should show the item it will remove", async () => {
        const user = userEvent.setup();
        await renderWantedItems();

        const dialog = await openRemoveDialog(user);

        expect(dialog).toHaveTextContent(/Covert.*AWP \| Asiimov.*Factory New · Max −3%/);
    });

    it("Should remove the item and update the counts", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const deletes = captureBodies("DELETE");
        const dialog = await openRemoveDialog(user);

        await user.click(within(dialog).getByRole("button", { name: "Remove" }));

        await waitFor(() => expect(screen.queryByRole("article", { name: NEWEST_ITEM })).not.toBeInTheDocument());
        expect(deletes.map(({ path }) => path)).toEqual([`/accounts/6528461/wanted-items/${NEWEST_ITEM}`]);
        expect(screen.getByText(/Bot is bidding on/)).toHaveTextContent("40 of 46");
    });

    it("Should pause the item instead of removing it", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const deletes = captureBodies("DELETE");
        const dialog = await openRemoveDialog(user);

        await user.click(within(dialog).getByRole("button", { name: "Pause instead" }));

        await waitFor(() => expect(dialog).not.toBeInTheDocument());
        expect(screen.getByRole("article", { name: NEWEST_ITEM })).toHaveTextContent("Paused");
        expect(deletes).toEqual([]);
    });

    it("Should say when the bot can't remove the item", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        mswServer.use(removeWantedItemNotFoundMock());
        const dialog = await openRemoveDialog(user);

        await user.click(within(dialog).getByRole("button", { name: "Remove" }));

        expect(await within(dialog).findByRole("alert")).toHaveTextContent("The bot couldn't remove this item");
    });

    it("Should keep the item from being paused while it is being removed", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        mswServer.use(removeWantedItemPendingMock());
        const dialog = await openRemoveDialog(user);

        await user.click(within(dialog).getByRole("button", { name: "Remove" }));

        expect(within(dialog).getByRole("button", { name: "Pause instead" })).toBeDisabled();
    });

    it("Should refresh the list when the item was already gone", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const gets = captureBodies("GET");
        mswServer.use(removeWantedItemNotFoundMock());
        const dialog = await openRemoveDialog(user);

        await user.click(within(dialog).getByRole("button", { name: "Remove" }));

        await waitFor(() => expect(gets.some(({ path }) => path.endsWith("/wanted-items"))).toBe(true));
    });
});
