import type { Container } from "inversify";
import { Account } from "@/contexts/trading/bidding/domain/account/account";
import { AccountId } from "@/contexts/trading/bidding/domain/account/account-id";
import { testContainer } from "@/__builders__/test-container.builder";
import { ACCOUNT_REPOSITORY, ACCOUNT_STORE } from "@/contexts/trading/bidding/external/di/bidding.identifiers";

let container: Container;

describe("AccountRepository", () => {
    beforeEach(() => {
        container = testContainer();
    });
    it("Should save and find an account by id", async () => {
        const accountRepository = container.get(ACCOUNT_REPOSITORY);
        await accountRepository.save(
            Account.sync({ id: 1, name: "John Doe", totalAmount: 300000, reservations: { 1: 100, 2: 222281 } }),
        );

        const account = await accountRepository.findById(new AccountId(1));

        expect(account!.getId()).toBe(1);
    });
    it("Should return all accounts", async () => {
        const accountRepository = container.get(ACCOUNT_REPOSITORY);
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
        const account = await container.get(ACCOUNT_REPOSITORY).findById(new AccountId(2));

        expect(account).toBe(undefined);
    });
    it("Should find a saved account with its balance and reservations", async () => {
        const accountRepository = container.get(ACCOUNT_REPOSITORY);
        const saved = Account.sync({ id: 1, name: "John Doe", totalAmount: 300, reservations: { 7: 100 } });
        await accountRepository.save(saved);

        const account = await accountRepository.findById(new AccountId(1));

        expect(account?.toPrimitives()).toEqual(saved.toPrimitives());
    });
    it("Should store the account's balance for the read side", async () => {
        await container
            .get(ACCOUNT_REPOSITORY)
            .save(Account.sync({ id: 1, name: "John Doe", totalAmount: 300, reservations: { 7: 100 } }));

        const record = container.get(ACCOUNT_STORE).find(1);

        expect(record?.balance).toEqual({ total: 300, reserved: 100, available: 200 });
    });
    it("Should keep a reservation made meanwhile when another holder of the account refunds", async () => {
        const accountRepository = container.get(ACCOUNT_REPOSITORY);
        await accountRepository.save(Account.sync({ id: 1, name: "John Doe", totalAmount: 1000 }));
        const first = await accountRepository.findById(new AccountId(1));
        first?.reserveFor(10, 300);
        await accountRepository.save(first!);
        const second = await accountRepository.findById(new AccountId(1));
        second?.reserveFor(20, 400);
        await accountRepository.save(second!);
        first?.refundFor(10);

        await accountRepository.save(first!);

        expect((await accountRepository.findById(new AccountId(1)))?.hasReservationFor(20)).toBe(true);
    });
});
