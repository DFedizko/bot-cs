import { botApiHttp } from "@/__mocks__/bot-api-failure.mock";

const NOT_FOUND = { code: "WANTED_ITEM_NOT_FOUND", message: "The account doesn't want the item" };

export const removeWantedItemNotFoundMock = () =>
    botApiHttp.delete("/accounts/{accountId}/wanted-items/{name}", ({ response }) => response(404).json(NOT_FOUND));
