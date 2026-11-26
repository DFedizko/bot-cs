import { expect, test } from "@playwright/test";

const WANTED_ITEMS_PATH = "/accounts/6528461/wanted-items";
const ITEM = "AWP | Asiimov (Factory New)";

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
