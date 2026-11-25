import type { Container } from "inversify";
import { testContainer } from "@/__builders__/test-container.builder";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { ACCOUNT_REPOSITORY, ACCOUNTS_DAO } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

const MAIN = { id: 6528461, name: "Empire main", totalAmount: 1248036, reservations: { 288767047: 17149 } };
const ALT = { id: 7104022, name: "Empire alt", totalAmount: 0 };

let container: Container;

describe("AccountsDaoInMemory", () => {
    beforeEach(() => {
        container = testContainer();
    });

    it("Should list the accounts saved through the repository with their balance", async () => {
        await container.get(ACCOUNT_REPOSITORY).save(Account.sync(MAIN));
        await container.get(ACCOUNT_REPOSITORY).save(Account.sync(ALT));

        const response = await container.get(ACCOUNTS_DAO).list();

        expect(response).toEqual({
            items: [
                {
                    id: "6528461",
                    name: "Empire main",
                    balance: { total: 1248036, reserved: 17149, available: 1230887 },
                },
                { id: "7104022", name: "Empire alt", balance: { total: 0, reserved: 0, available: 0 } },
            ],
        });
    });

    it("Should list the balance the account has after its last save", async () => {
        const account = Account.sync(MAIN);
        await container.get(ACCOUNT_REPOSITORY).save(account);
        account.refundFor(288767047);
        await container.get(ACCOUNT_REPOSITORY).save(account);

        const { items } = await container.get(ACCOUNTS_DAO).list();

        expect(items.map(({ balance }) => balance)).toEqual([{ total: 1248036, reserved: 0, available: 1248036 }]);
    });

    it("Should list nothing before any account is synchronized", async () => {
        const response = await container.get(ACCOUNTS_DAO).list();

        expect(response).toEqual({ items: [] });
    });

    it("Should not let a caller change the stored account through its DTO", async () => {
        await container.get(ACCOUNT_REPOSITORY).save(Account.sync(MAIN));
        const dao = container.get(ACCOUNTS_DAO);
        const { items } = await dao.list();

        items.forEach((item) => (item.balance.total = 0));

        expect((await dao.list()).items.map(({ balance }) => balance.total)).toEqual([MAIN.totalAmount]);
    });
});
