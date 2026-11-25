import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { QUERY_BUS } from "@/packages/external/di/packages.identifiers";
import { ListAccountsQuery } from "@/contexts/trading/bidding/application/list-accounts/list-accounts.query";
import { ACCOUNTS_DAO, LIST_ACCOUNTS_HANDLER } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const ACCOUNTS = {
    items: [{ id: "6528461", name: "Empire main", balance: { total: 1248036, reserved: 17149, available: 1230887 } }],
};

let container: Container;

describe("ListAccountsQueryHandler", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should answer with the accounts the DAO reads", async () => {
        jest.spyOn(container.get(ACCOUNTS_DAO), "list").mockResolvedValue(ACCOUNTS);

        const response = await container.get(LIST_ACCOUNTS_HANDLER).handle(new ListAccountsQuery());

        expect(response).toEqual(ACCOUNTS);
    });

    it("Should be asked through the query bus", async () => {
        jest.spyOn(container.get(ACCOUNTS_DAO), "list").mockResolvedValue(ACCOUNTS);

        const response = await container.get(QUERY_BUS).ask(new ListAccountsQuery());

        expect(response).toEqual(ACCOUNTS);
    });
});
