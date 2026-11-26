import { describe, expect, it } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import { createAppWrapper } from "@/__builders__/create-app-wrapper";
import { mockBotApiMock } from "@/__mocks__/mock-bot-api.mock";
import { mswServer } from "@/__setup__/msw-server";
import { useAccountSwitcherViewModel } from "@/features/accounts/view-model/useAccountSwitcherViewModel";
import { listAccountsFailureMock } from "../__mocks__/list-accounts-failure.mock";

const MAIN_ACCOUNT_ID = "6528461";
const ALT_ACCOUNT_ID = "7104022";

const renderViewModel = (accountId: string) =>
    renderHook(() => useAccountSwitcherViewModel(accountId), { wrapper: createAppWrapper() });

describe("useAccountSwitcherViewModel", () => {
    it("Should start loading the accounts", () => {
        mswServer.use(...mockBotApiMock());

        const { result } = renderViewModel(MAIN_ACCOUNT_ID);

        expect(result.current.status).toBe("loading");
    });

    it("Should describe the current account with its id and coin balance", async () => {
        mswServer.use(...mockBotApiMock());

        const { result } = renderViewModel(MAIN_ACCOUNT_ID);

        await waitFor(() =>
            expect(result.current.current).toEqual({
                id: MAIN_ACCOUNT_ID,
                name: "Empire main",
                initial: "E",
                balance: "12,480.36",
            }),
        );
    });

    it("Should list every account to switch to, marking the current one", async () => {
        mswServer.use(...mockBotApiMock());

        const { result } = renderViewModel(ALT_ACCOUNT_ID);

        await waitFor(() => expect(result.current.status).toBe("ready"));
        expect(result.current.accounts.map(({ id, isCurrent }) => [id, isCurrent])).toEqual([
            [MAIN_ACCOUNT_ID, false],
            [ALT_ACCOUNT_ID, true],
        ]);
    });

    it("Should fail when the accounts can't be loaded", async () => {
        mswServer.use(listAccountsFailureMock());

        const { result } = renderViewModel(MAIN_ACCOUNT_ID);

        await waitFor(() => expect(result.current.status).toBe("error"));
    });
});
