import { Decimal } from "@/shared/domain-primitives/decimal";
import { DomainError } from "@/shared/error/domain-error";

test("Should create a decimal number", () => expect(new Decimal(0.9).getValue()).toBe(0.9));
test("Should throw an error when create a decimal number with integer value", () =>
    expect(() => new Decimal(1)).toThrow(DomainError));
