import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

export async function searchCatalog(user: UserEvent, text: string) {
    await user.click(screen.getByRole("button", { name: /Search any item/ }));
    await user.type(await screen.findByRole("combobox", { name: "Search any item" }), text);
}

export async function openAddDialog(user: UserEvent, text: string, itemName: string) {
    await searchCatalog(user, text);
    await user.click(await screen.findByRole("option", { name: itemName }));
    return screen.findByRole("dialog", { name: "Add wanted item" });
}
