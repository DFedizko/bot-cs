import { DomainError } from "../error/domain-error";
import { Currency } from "./currency";
import { Money } from "./money";

export class PositiveMoney extends Money {
    static fromCents({ amount, currency }: { amount: number; currency: Currency }): PositiveMoney {
        PositiveMoney.validatePositive(amount);
        Money.validateInteger(amount);
        return new PositiveMoney({ amount, currency });
    }

    static fromDecimal({ amount, currency }: { amount: string; currency: Currency }): PositiveMoney {
        const minorUnits = Money.transformInMinorUnits({ amount: amount, currency });
        PositiveMoney.validatePositive(minorUnits);
        return new PositiveMoney({ amount: minorUnits, currency });
    }

    private static validatePositive(amount: number | bigint): void {
        if (amount < 0n) throw new DomainError({ message: `The amount provided: "${amount}" must be positive` });
    }
}
