import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { HTTP_SERVER, QUERY_BUS } from "@/packages/external/di/packages.identifiers";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { ListAccountsQuery } from "@/contexts/trading/bidding/application/list-accounts/list-accounts.query";
import { ACCOUNT_REPOSITORY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { startWantedItemsApi } from "./__builders__/wanted-items-api.builder";

const GET = "GET";
const ACCOUNTS_PATH = "/accounts";
const MAIN = { id: 6528461, name: "Empire main", totalAmount: 1248036, reservations: { 288767047: 17149 } };

let container: Container;

describe("ListAccountsHttpController", () => {
    beforeEach(() => {
        container = testContainer();
    });

    afterEach(async () => {
        await container.get(HTTP_SERVER).close();
    });

    it("Should list the synchronized accounts with their balance", async () => {
        await container.get(ACCOUNT_REPOSITORY).save(Account.sync(MAIN));
        const api = await startWantedItemsApi(container);

        const response = await api.send(GET, ACCOUNTS_PATH);

        expect({ ...response, body: JSON.parse(response.body) }).toEqual({
            status: HttpStatus.OK,
            body: {
                items: [
                    {
                        id: "6528461",
                        name: "Empire main",
                        balance: { total: 1248036, reserved: 17149, available: 1230887 },
                    },
                ],
            },
        });
    });

    it("Should list nothing before any account is synchronized", async () => {
        const api = await startWantedItemsApi(container);

        const response = await api.send(GET, ACCOUNTS_PATH);

        expect(JSON.parse(response.body)).toEqual({ items: [] });
    });

    it("Should ask the query bus for the accounts", async () => {
        const askSpy = jest.spyOn(container.get(QUERY_BUS), "ask");
        const api = await startWantedItemsApi(container);

        await api.send(GET, ACCOUNTS_PATH);

        expect(askSpy).toHaveBeenCalledWith(new ListAccountsQuery());
    });
});
