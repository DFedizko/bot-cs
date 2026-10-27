import { Integer } from "@/packages/domain-primitives/integer";
import { DomainError } from "@/packages/error/domain-error";

test("Should create a integer number", () => expect(new Integer(1).getValue()).toBe(1));
test("Should throw an error when use a decimal number", () => expect(() => new Integer(1.1)).toThrow(DomainError));
