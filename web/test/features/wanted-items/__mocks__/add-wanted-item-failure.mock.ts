import { BOT_API_FAILURE, botApiHttp } from "@/__mocks__/bot-api-failure.mock";

export const addWantedItemFailureMock = () =>
    botApiHttp.post("/accounts/{accountId}/wanted-items", ({ response }) => response(500).json(BOT_API_FAILURE));
