import type { AccountRepository } from "@/contexts/trading/bidding/application/account.repository";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { testContainer } from "@/__builders__/test-container.builder";
import { ACCOUNT_REPOSITORY } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

let accountRepository: AccountRepository;
describe("AccountRepository", () => {
    beforeEach(() => {
        accountRepository = testContainer().get(ACCOUNT_REPOSITORY);
    });
    it("Should save and find an account by id", async () => {
        await accountRepository.save(
            Account.sync({ id: 1, name: "John Doe", totalAmount: 300000, reservations: { 1: 100, 2: 222281 } }),
        );
        const account = await accountRepository.findById(new AccountId(1));
        expect(account!.getId()).toBe(1);
    });
    it("Should return all accounts", async () => {
        const account1 = Account.sync({
            id: 1,
            name: "John Doe",
            totalAmount: 300000,
            reservations: { 1: 100, 2: 100 },
        });
        const account2 = Account.sync({ id: 2, name: "John Doe", totalAmount: 200, reservations: { 1: 100, 2: 100 } });
        await accountRepository.save(account1);
        await accountRepository.save(account2);
        const accounts = await accountRepository.findMany();
        expect(accounts).toMatchObject([account1, account2]);
    });
    it("Should return undefined when an account was not found by the id", async () => {
        const account = await accountRepository.findById(new AccountId(2));
        expect(account).toBe(undefined);
    });
});
