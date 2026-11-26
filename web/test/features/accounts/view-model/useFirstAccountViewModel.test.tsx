import { describe, expect, it } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import { createAppWrapper } from "@/__builders__/create-app-wrapper";
import { mockBotApiMock } from "@/__mocks__/mock-bot-api.mock";
import { mswServer } from "@/__setup__/msw-server";
import { useFirstAccountViewModel } from "@/features/accounts/view-model/useFirstAccountViewModel";
import { listAccountsFailureMock } from "../__mocks__/list-accounts-failure.mock";

const MAIN_ACCOUNT_ID = "6528461";

const renderViewModel = () => renderHook(() => useFirstAccountViewModel(), { wrapper: createAppWrapper() });

describe("useFirstAccountViewModel", () => {
    it("Should point to the first account the bot trades for", async () => {
        mswServer.use(...mockBotApiMock());

        const { result } = renderViewModel();

        await waitFor(() => expect(result.current).toEqual({ status: "ready", accountId: MAIN_ACCOUNT_ID }));
    });

    it("Should say there is no account when the bot trades for none", async () => {
        mswServer.use(...mockBotApiMock({ accounts: [] }));

        const { result } = renderViewModel();

        await waitFor(() => expect(result.current.status).toBe("empty"));
    });

    it("Should fail when the accounts can't be loaded", async () => {
        mswServer.use(listAccountsFailureMock());

        const { result } = renderViewModel();

        await waitFor(() => expect(result.current.status).toBe("error"));
    });
});
