import type { Page } from "@playwright/test";

export async function openAddDialog(page: Page, text: string, itemName: string) {
    await page.getByRole("button", { name: "Add wanted item" }).click();
    await page.getByRole("combobox", { name: "Search any item" }).fill(text);
    await page.getByRole("option", { name: itemName, exact: true }).click();
    return page.getByRole("dialog", { name: "Add wanted item" });
}
