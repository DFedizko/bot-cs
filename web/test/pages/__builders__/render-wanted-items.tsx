import { screen, within } from "@testing-library/react";
import { renderApp } from "@/__builders__/render-app";
import { mockBotApiMock } from "@/__mocks__/mock-bot-api.mock";
import { mswServer } from "@/__setup__/msw-server";

export const WANTED_ITEMS_PATH = "/accounts/6528461/wanted-items";
const ITEMS_LIST = { name: "Wanted items" };

export const findItems = async () => within(await screen.findByRole("list", ITEMS_LIST)).findAllByRole("article");

export const itemNames = async () => (await findItems()).map((item) => item.getAttribute("aria-label"));

export async function renderWantedItems(search = "") {
    mswServer.use(...mockBotApiMock());
    const rendered = renderApp(`${WANTED_ITEMS_PATH}${search}`);
    await findItems();
    return rendered;
}
