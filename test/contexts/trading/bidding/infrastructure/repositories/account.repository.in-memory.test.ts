import type { AccountRepository } from "@/contexts/trading/bidding/application/account.repository";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { AccountRepositoryInMemory } from "@/contexts/trading/bidding/infrastructure/repositories/account.repository.in-memory";
import { NotFoundError } from "@/packages/infrastructure/http/errors/not-found.error";

let accountRepository: AccountRepository;
describe("AccountRepository", () => {
    beforeEach(() => {
        accountRepository = new AccountRepositoryInMemory();
    });
    it("Should save and find an account by id", async () => {
        await accountRepository.save(Account.create({ id: 1 }));
        const account = await accountRepository.findById(new AccountId(1));
        expect(account.getId()).toBe(1);
    });
    it("Should throw an error when an account was not found by the id", () =>
        expect(async () => await accountRepository.findById(new AccountId(2))).toThrow(NotFoundError));
});
