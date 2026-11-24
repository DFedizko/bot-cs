import { describe, expect, it } from "bun:test";
import { QueryClient } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { mswServer } from "@/__setup__/msw-server";
import { TEST_BOT_API_URL } from "@/__builders__/test-bot-api-url";
import { AppProviders } from "@/app/app-providers";
import { HttpClientAxiosAdapter } from "@/shared/adapters/axios/http-client.axios-adapter";
import { useHttpClient } from "@/shared/lib/http/http-client";

const HEALTH_PATH = "/health";
const HEALTH = { status: "ok" };

const createWrapper = () => {
    const queryClient = new QueryClient();
    const httpClient = new HttpClientAxiosAdapter(TEST_BOT_API_URL);
    return ({ children }: { children: ReactNode }) => (
        <AppProviders queryClient={queryClient} httpClient={httpClient}>
            {children}
        </AppProviders>
    );
};

describe("AppProviders", () => {
    it("Should bind the HTTP client that reaches the bot's API", async () => {
        mswServer.use(http.get(`${TEST_BOT_API_URL}${HEALTH_PATH}`, () => HttpResponse.json(HEALTH)));
        const { result } = renderHook(() => useHttpClient(), { wrapper: createWrapper() });

        const health = await result.current.get(HEALTH_PATH);

        expect(health).toEqual(HEALTH);
    });
});
