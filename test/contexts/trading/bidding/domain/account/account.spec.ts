import { Account } from "@/contexts/trading/bidding/domain/account/account";

describe("Account", () => {
    it("Should create an account", () => expect(Account.create({ id: 1 }).getId()).toBe(1));
    it("Should verify if it's me", () => expect(Account.create({ id: 123 }).isMe(123)).toBe(true));
});
