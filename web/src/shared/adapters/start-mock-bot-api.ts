import { readViteAppConfig } from "./read-vite-app-config";

const UNHANDLED_REQUESTS = "bypass";
const SWITCH_ON = "true";

export async function startMockBotApi(): Promise<void> {
    if (import.meta.env.VITE_MOCK_BOT_API !== SWITCH_ON) return;
    const [{ setupWorker }, { createMockBotApiHandlers }] = await Promise.all([
        import("msw/browser"),
        import("./mock-bot-api/create-mock-bot-api-handlers"),
    ]);
    const worker = setupWorker(...createMockBotApiHandlers(readViteAppConfig().botApiUrl));
    await worker.start({ onUnhandledRequest: UNHANDLED_REQUESTS });
}
