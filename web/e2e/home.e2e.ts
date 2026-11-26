import { expect, test } from "@playwright/test";

test("Should open the first account's wanted items", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Wanted items" })).toBeVisible();
    await expect(page).toHaveURL(/\/accounts\/6528461\/wanted-items$/);
});
