import { UUID } from "@/shared/domain-primitives/uuid";
import { DomainError } from "@/shared/error/domain-error";

test("Should create a valid UUID", () => expect(UUID.create().getValue()).toBeTypeOf("string"));
test("Should validate a UUID", () => {
    expect(UUID.isValid("111-222-33-4444")).toBe(false);
    expect(UUID.isValid(crypto.randomUUID())).toBe(true);
});
test("Should throw an error when use a invalid UUID", () =>
    expect(() => UUID.restore("1111-222-3333-444")).toThrow(DomainError));
