import { delay } from "msw";
import { botApiHttp } from "@/__mocks__/bot-api-failure.mock";

export const removeWantedItemPendingMock = () =>
    botApiHttp.delete("/accounts/{accountId}/wanted-items/{name}", async ({ response }) => {
        await delay("infinite");
        return response(200).empty();
    });
