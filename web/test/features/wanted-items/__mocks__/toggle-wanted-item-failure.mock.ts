import { delay } from "msw";
import { BOT_API_FAILURE, botApiHttp } from "@/__mocks__/bot-api-failure.mock";

const FAILURE_DELAY_MS = 50;

export const toggleWantedItemFailureMock = () =>
    botApiHttp.patch("/accounts/{accountId}/wanted-items/{name}/enabled", async ({ response }) => {
        await delay(FAILURE_DELAY_MS);
        return response(500).json(BOT_API_FAILURE);
    });
