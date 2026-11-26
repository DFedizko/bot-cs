import { afterEach, describe, expect, it } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mswServer } from "@/__setup__/msw-server";
import { addWantedItemFailureMock } from "@/features/wanted-items/__mocks__/add-wanted-item-failure.mock";
import { captureBodies } from "./__builders__/capture-bodies";
import { openAddDialog } from "./__builders__/open-add-dialog";
import { renderWantedItems } from "./__builders__/render-wanted-items";

const VANILLA_KARAMBIT = "★ Karambit";
const WANTED_DOPPLER = "★ Karambit | Doppler (Factory New)";
const ASIIMOV_FT = "AWP | Asiimov (Field-Tested)";
const ADD_BUTTON = { name: "Add wanted item" };

const submit = async (user: ReturnType<typeof userEvent.setup>, dialog: HTMLElement) =>
    user.click(within(dialog).getByRole("button", ADD_BUTTON));

describe("WantedItemsPage add", () => {
    afterEach(() => mswServer.events.removeAllListeners());

    it("Should add an item with a max percentage and count it", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const posts = captureBodies("POST");
        const dialog = await openAddDialog(user, "★ karambit", VANILLA_KARAMBIT);

        await user.click(within(dialog).getByRole("button", { name: "−5%" }));
        await submit(user, dialog);

        await waitFor(() => expect(screen.getByText(/Bot is bidding on/)).toHaveTextContent("42 of 48"));
        expect(dialog).not.toBeInTheDocument();
        expect(posts.map(({ body }) => body)).toEqual([
            { name: VANILLA_KARAMBIT, maxFor: { type: "percentage", value: -5 }, criteria: [] },
        ]);
    });

    it("Should add an item with a max value of whole coins, sent in coin cents", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const posts = captureBodies("POST");
        const dialog = await openAddDialog(user, "★ karambit", VANILLA_KARAMBIT);

        await user.click(within(dialog).getByRole("radio", { name: "Fixed value" }));
        await user.type(within(dialog).getByRole("textbox", { name: "Max value" }), "10");
        await submit(user, dialog);

        await waitFor(() => expect(posts.at(0)?.body).toMatchObject({ maxFor: { type: "value", value: 1000 } }));
    });

    it("Should refuse a max value that isn't whole coins above zero", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const posts = captureBodies("POST");
        const dialog = await openAddDialog(user, "★ karambit", VANILLA_KARAMBIT);
        await user.click(within(dialog).getByRole("radio", { name: "Fixed value" }));
        await user.type(within(dialog).getByRole("textbox", { name: "Max value" }), "2.5");

        await submit(user, dialog);

        expect(within(dialog).getByText("Enter a whole number of coins above zero")).toBeInTheDocument();
        expect(posts).toEqual([]);
    });

    it("Should prefill the item's wear and ask for it", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const posts = captureBodies("POST");
        const dialog = await openAddDialog(user, "asiimov field", ASIIMOV_FT);

        expect(within(dialog).getByRole("radio", { name: "Field-Tested" })).toBeChecked();
        await submit(user, dialog);

        await waitFor(() =>
            expect(posts.at(0)?.body).toMatchObject({ criteria: [{ type: "IsWear", value: "Field-Tested" }] }),
        );
    });

    it("Should say when the item is already in the list and keep it from being added", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const dialog = await openAddDialog(user, "doppler factory", WANTED_DOPPLER);

        await submit(user, dialog);

        expect(await within(dialog).findByText("This item is already in your wanted list")).toBeInTheDocument();
        expect(within(dialog).getByRole("button", ADD_BUTTON)).toBeDisabled();
    });

    it("Should add an item paused when it shouldn't start enabled", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const dialog = await openAddDialog(user, "★ karambit", VANILLA_KARAMBIT);

        await user.click(within(dialog).getByRole("switch", { name: "Start enabled" }));
        await submit(user, dialog);

        expect(await screen.findByRole("article", { name: VANILLA_KARAMBIT })).toHaveTextContent("Paused");
    });

    it("Should say when the bot can't add the item", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        mswServer.use(addWantedItemFailureMock());
        const dialog = await openAddDialog(user, "★ karambit", VANILLA_KARAMBIT);

        await submit(user, dialog);

        expect(await within(dialog).findByRole("alert")).toHaveTextContent("The bot couldn't add this item");
    });

    it("Should close without adding when cancelled", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const posts = captureBodies("POST");
        const dialog = await openAddDialog(user, "★ karambit", VANILLA_KARAMBIT);

        await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

        await waitFor(() => expect(dialog).not.toBeInTheDocument());
        expect(posts).toEqual([]);
    });
});
