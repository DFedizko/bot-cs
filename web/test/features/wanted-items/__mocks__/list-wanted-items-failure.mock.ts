import { BOT_API_FAILURE, botApiHttp } from "@/__mocks__/bot-api-failure.mock";

export const listWantedItemsFailureMock = () =>
    botApiHttp.get("/accounts/{accountId}/wanted-items", ({ response }) => response(500).json(BOT_API_FAILURE));
