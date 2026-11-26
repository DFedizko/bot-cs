import { expect, test } from "@playwright/test";
import { openAddDialog } from "./__steps__/open-add-dialog";

const WANTED_ITEMS_PATH = "/accounts/6528461/wanted-items";
const ITEM = "AWP | Asiimov (Factory New)";
const VANILLA_KARAMBIT = "★ Karambit";
const WANTED_DOPPLER = "★ Karambit | Doppler (Factory New)";
const ADD = { name: "Add wanted item" };

test("Should pause a wanted item and change page", async ({ page }) => {
    await page.goto(WANTED_ITEMS_PATH);
    const itemSwitch = page.getByRole("article", { name: ITEM, exact: true }).getByRole("switch");

    await itemSwitch.click();

    await expect(itemSwitch).not.toBeChecked();
    await expect(page.getByText(/Bot is bidding on/)).toContainText("40 of 47");

    await page.getByRole("button", { name: "Next page" }).click();

    await expect(page.getByText("Showing 19–36 of 47 items")).toBeVisible();
    await expect(page).toHaveURL(/page=2/);
});

test("Should search the catalog and add an item with a max percentage", async ({ page }) => {
    await page.goto(WANTED_ITEMS_PATH);
    const dialog = await openAddDialog(page, "karambit", VANILLA_KARAMBIT);

    await dialog.getByRole("button", { name: "−5%" }).click();
    await dialog.getByRole("button", ADD).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByRole("article").first()).toHaveAccessibleName(VANILLA_KARAMBIT);
    await expect(page.getByRole("article").first()).toContainText("−5%");
    await expect(page.getByText(/Bot is bidding on/)).toContainText("42 of 48");
});

test("Should add an item with a max value in coins", async ({ page }) => {
    await page.goto(WANTED_ITEMS_PATH);
    const dialog = await openAddDialog(page, "karambit", VANILLA_KARAMBIT);

    await dialog.getByRole("radio", { name: "Fixed value" }).click();
    await dialog.getByRole("textbox", { name: "Max value" }).fill("10");
    await dialog.getByRole("button", ADD).click();

    await expect(page.getByRole("article", { name: VANILLA_KARAMBIT, exact: true })).toContainText("10.00");
});

test("Should say when the item is already in the list", async ({ page }) => {
    await page.goto(WANTED_ITEMS_PATH);
    const dialog = await openAddDialog(page, "doppler factory", WANTED_DOPPLER);

    await dialog.getByRole("button", ADD).click();

    await expect(dialog.getByText("This item is already in your wanted list")).toBeVisible();
    await expect(dialog.getByRole("button", ADD)).toBeDisabled();
});

test("Should remove a wanted item", async ({ page }) => {
    await page.goto(WANTED_ITEMS_PATH);
    const card = page.getByRole("article", { name: ITEM, exact: true });

    await card.getByRole("button", { name: `Actions for ${ITEM}` }).click();
    await page.getByRole("menuitem", { name: "Remove" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Remove" }).click();

    await expect(card).toBeHidden();
    await expect(page.getByText(/Bot is bidding on/)).toContainText("40 of 46");
});
