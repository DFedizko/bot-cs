import { afterEach, describe, expect, it } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mswServer } from "@/__setup__/msw-server";
import { toggleWantedItemFailureMock } from "@/features/wanted-items/__mocks__/toggle-wanted-item-failure.mock";
import { renderWantedItems } from "./__builders__/render-wanted-items";

const NEWEST_ITEM = "AWP | Asiimov (Factory New)";
const PAUSE_PATH = `/accounts/6528461/wanted-items/${encodeURIComponent(NEWEST_ITEM)}/enabled`;

const itemSwitch = () => within(screen.getByRole("article", { name: NEWEST_ITEM })).getByRole("switch");

const captureBodies = () => {
    const bodies: Array<unknown> = [];
    mswServer.events.on("request:start", async ({ request }) => {
        if (new URL(request.url).pathname === PAUSE_PATH) bodies.push(await request.clone().json());
    });
    return bodies;
};

describe("WantedItemsPage switch", () => {
    afterEach(() => mswServer.events.removeAllListeners());

    it("Should pause an item at once and tell the bot", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        const bodies = captureBodies();

        await user.click(itemSwitch());

        expect(itemSwitch()).not.toBeChecked();
        expect(screen.getByText(/Bot is bidding on/)).toHaveTextContent("40 of 47");
        await waitFor(() => expect(bodies).toEqual([{ enabled: false }]));
    });

    it("Should switch the item back on when the bot fails to pause it", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        mswServer.use(toggleWantedItemFailureMock());

        await user.click(itemSwitch());

        expect(await screen.findByRole("switch", { name: `Bid on ${NEWEST_ITEM}`, checked: true })).toBeInTheDocument();
    });
});
