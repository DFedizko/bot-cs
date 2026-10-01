import { Integer } from "@/shared/domain-primitives/integer";
import { DomainError } from "@/shared/error/domain-error";

test("Should create a integer number", () => expect(new Integer(1).getValue()).toBe(1));
test("Should throw an error when use a decimal number", () => expect(() => new Integer(1.1)).toThrow(DomainError));
