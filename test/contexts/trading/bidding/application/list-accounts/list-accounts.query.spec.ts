import { ListAccountsQuery } from "@/contexts/trading/bidding/application/list-accounts/list-accounts.query";

describe("ListAccountsQuery", () => {
    it("Should be named after the list accounts use case", () => {
        const query = new ListAccountsQuery();

        expect(query.name).toBe("list_accounts");
    });
});
