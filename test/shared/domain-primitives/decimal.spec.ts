import { Decimal } from "@/shared/domain-primitives/decimal";
import { DomainError } from "@/shared/error/domain-error";

test("Should create a decimal number", () => expect(new Decimal(0.9).getValue()).toBe(0.9));
test("Should return the decimal places", () => expect(new Decimal(0.9123123).getDecimalPlaces()).toBe("9123123"));
test("Should return the quantity of decimal places", () =>
    expect(new Decimal(0.9123123).getDecimalPlacesNumber()).toBe(7));
test("Should throw an error when create a decimal number with integer value", () =>
    expect(() => new Decimal(1)).toThrow(DomainError));
