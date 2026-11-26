import { createOpenApiHttp } from "openapi-msw";
import { TEST_BOT_API_URL } from "@/__builders__/test-bot-api-url";
import type { paths } from "@/shared/api/bot-api";

export const BOT_API_FAILURE = { code: "INTERNAL_ERROR", message: "Something went wrong" };

export const botApiHttp = createOpenApiHttp<paths>({ baseUrl: TEST_BOT_API_URL });
