import { TEST_BOT_API_URL } from "@/__builders__/test-bot-api-url";
import { createMockBotApiHandlers } from "@/shared/adapters/mock-bot-api/create-mock-bot-api-handlers";
import type { MockBotApiData } from "@/shared/adapters/mock-bot-api/create-mock-bot-api-handlers";

export const mockBotApiMock = (data: MockBotApiData = {}) => createMockBotApiHandlers(TEST_BOT_API_URL, data);
