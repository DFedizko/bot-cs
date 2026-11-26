import { BOT_API_FAILURE, botApiHttp } from "@/__mocks__/bot-api-failure.mock";

export const removeWantedItemFailureMock = () =>
    botApiHttp.delete("/accounts/{accountId}/wanted-items/{name}", ({ response }) =>
        response(500).json(BOT_API_FAILURE),
    );
