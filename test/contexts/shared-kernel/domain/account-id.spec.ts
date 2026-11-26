import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { DomainError } from "@/packages/error/domain-error";

const MARKETPLACE_USER_ID = 1234567;

describe("AccountId", () => {
    it("Should keep the marketplace user id", () => {
        const accountId = new AccountId(MARKETPLACE_USER_ID);

        expect(accountId.getValue()).toBe(MARKETPLACE_USER_ID);
    });

    it("Should reject a negative id", () => {
        expect(() => new AccountId(-1)).toThrow(DomainError);
    });

    it("Should reject an id that is not an integer", () => {
        expect(() => new AccountId(1.5)).toThrow(DomainError);
    });

    it("Should equal another id with the same value", () => {
        expect(new AccountId(MARKETPLACE_USER_ID).equals(new AccountId(MARKETPLACE_USER_ID))).toBe(true);
    });
});
