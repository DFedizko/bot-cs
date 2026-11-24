import { describe, expect, it } from "bun:test";
import { readViteAppConfig } from "@/shared/adapters/read-vite-app-config";

const BOT_API_URL = "http://bot.example:4000";
const LOCAL_BOT_API_URL = "http://localhost:3000";
const EMPTY = "";

describe("readViteAppConfig", () => {
    it("Should read the bot's API URL from VITE_BOT_API_URL", () => {
        const config = readViteAppConfig({ VITE_BOT_API_URL: BOT_API_URL });

        expect(config.botApiUrl).toBe(BOT_API_URL);
    });

    it("Should use the local bot when VITE_BOT_API_URL is missing", () => {
        const config = readViteAppConfig({});

        expect(config.botApiUrl).toBe(LOCAL_BOT_API_URL);
    });

    it("Should use the local bot when VITE_BOT_API_URL is empty", () => {
        const config = readViteAppConfig({ VITE_BOT_API_URL: EMPTY });

        expect(config.botApiUrl).toBe(LOCAL_BOT_API_URL);
    });
});
