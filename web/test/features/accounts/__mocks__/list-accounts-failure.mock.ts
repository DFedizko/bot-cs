import { BOT_API_FAILURE, botApiHttp } from "@/__mocks__/bot-api-failure.mock";

export const listAccountsFailureMock = () =>
    botApiHttp.get("/accounts", ({ response }) => response(500).json(BOT_API_FAILURE));
