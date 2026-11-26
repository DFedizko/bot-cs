import { defineConfig, devices } from "@playwright/test";

const APP_PORT = 5173;
const APP_URL = `http://localhost:${APP_PORT}`;
const IS_CI = Boolean(process.env.CI);

export default defineConfig({
    testDir: "./e2e",
    testMatch: "**/*.e2e.ts",
    fullyParallel: true,
    forbidOnly: IS_CI,
    retries: IS_CI ? 2 : 0,
    reporter: "list",
    use: {
        baseURL: APP_URL,
        trace: "on-first-retry",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: "bun run dev:mocks",
        url: APP_URL,
        reuseExistingServer: !IS_CI,
    },
});
