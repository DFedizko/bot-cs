import { expect, test } from "@playwright/test";

const APP_NAME = "bot-cs";

test("Should open the home page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: APP_NAME })).toBeVisible();
});
