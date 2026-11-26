import { describe, expect, it } from "bun:test";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWantedItems } from "./__builders__/render-wanted-items";
import { searchCatalog } from "./__builders__/open-add-dialog";

const VANILLA_KARAMBIT = "★ Karambit";

describe("WantedItemsPage search", () => {
    it("Should find catalog items grouped by category", async () => {
        const user = userEvent.setup();
        await renderWantedItems();

        await searchCatalog(user, "asiimov factory");

        const group = await screen.findByRole("group", { name: "Sniper Rifles" });
        expect(
            within(group)
                .getAllByRole("option")
                .map((option) => option.getAttribute("data-value")),
        ).toEqual(["AWP | Asiimov (Factory New)", "StatTrak™ AWP | Asiimov (Factory New)"]);
    });

    it("Should show each result's rarity, weapon and wear", async () => {
        const user = userEvent.setup();
        await renderWantedItems();

        await searchCatalog(user, "asiimov factory");

        expect(await screen.findByRole("option", { name: "AWP | Asiimov (Factory New)" })).toHaveTextContent(
            /Covert.*AWP.*Factory New/,
        );
    });

    it("Should count the results", async () => {
        const user = userEvent.setup();
        await renderWantedItems();

        await searchCatalog(user, "asiimov factory");

        expect(await screen.findByText("2 results")).toBeInTheDocument();
    });

    it("Should say when no item matches", async () => {
        const user = userEvent.setup();
        await renderWantedItems();

        await searchCatalog(user, "karambti dopler");

        expect(await screen.findByText("No items match “karambti dopler”")).toBeInTheDocument();
    });

    it("Should ask for two characters before searching", async () => {
        const user = userEvent.setup();
        await renderWantedItems();

        await searchCatalog(user, "a");

        expect(screen.getByText("Type at least 2 characters to search the catalog.")).toBeInTheDocument();
    });

    it("Should open the add dialog for the item chosen with the keyboard", async () => {
        const user = userEvent.setup();
        await renderWantedItems();
        await searchCatalog(user, "★ karambit");
        await screen.findByRole("option", { name: VANILLA_KARAMBIT });

        await user.keyboard("{Enter}");

        const dialog = await screen.findByRole("dialog", { name: "Add wanted item" });
        expect(within(dialog).getByRole("heading", { name: VANILLA_KARAMBIT })).toBeInTheDocument();
    });

    it("Should open the search from the add button of the top bar", async () => {
        const user = userEvent.setup();
        await renderWantedItems();

        await user.click(screen.getByRole("button", { name: "Add wanted item" }));

        expect(await screen.findByRole("combobox", { name: "Search any item" })).toHaveFocus();
    });
});
