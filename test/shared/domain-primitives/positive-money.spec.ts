import { COIN } from "@/shared-kernel/domain/currencies";
import { PositiveMoney } from "@/shared/domain-primitives/positive-money";
import { DomainError } from "@/shared/error/domain-error";

test("Should throw an error when create a money object with negative cents", () =>
    expect(() => PositiveMoney.fromCents({ amount: -1, currency: COIN })).toThrow(DomainError));
test("Should throw an error when create a money object with negative decimal", () =>
    expect(() => PositiveMoney.fromDecimal({ amount: "-0.01", currency: COIN })).toThrow(DomainError));
