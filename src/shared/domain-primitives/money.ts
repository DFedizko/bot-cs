import { DomainError } from "@/shared/error/domain-error";
import { ValueObject } from "@/shared/building-blocks/value-object";
import { Percentage, RoundingMode } from "./percentage";
import { Currency } from "./currency";

enum ERROR_CODE {
    INVALID_AMOUNT = "INVALID_AMOUNT",
    INVALID_CURRENCY = "INVALID_CURRENCY",
}

type MoneyProps = {
    amount: bigint;
    currency: Currency;
};

export class Money extends ValueObject<MoneyProps> {
    private static readonly DECIMAL_REGEX: RegExp = /^-?\d+(\.\d+)?$/;

    protected constructor(value: MoneyProps) {
        super(value);
    }

    static fromCents({ amount = 0, currency }: { amount: number | bigint; currency: Currency }): Money {
        if (typeof amount === "number" && !Number.isInteger(amount)) {
            throw new DomainError({
                message: `The amount of "${amount}" is not a integer`,
                code: ERROR_CODE.INVALID_AMOUNT,
            });
        }
        return new Money({ amount: BigInt(amount), currency });
    }

    static fromDecimal({ amount, currency }: { amount: string; currency: Currency }): Money {
        const trimmed = amount.trim();
        if (!Money.DECIMAL_REGEX.test(trimmed)) {
            throw new DomainError({
                message: `Invalid decimal value "${amount}"`,
                code: ERROR_CODE.INVALID_AMOUNT,
            });
        }

        const isNegative = trimmed.startsWith("-");
        const unsigned = isNegative ? trimmed.slice(1) : trimmed;

        const [intPart, fracPart = ""] = unsigned.split(".");
        const fracAdjusted = fracPart.padEnd(currency.getDecimals(), "0").slice(0, currency.getDecimals());

        const minor = BigInt(intPart + fracAdjusted);

        return new Money({ amount: isNegative ? -minor : minor, currency });
    }

    add(other: Money): Money {
        this.assertSameCurrency(other);
        return new Money({
            amount: this.value.amount + other.getAmount(),
            currency: this.value.currency,
        });
    }

    substract(other: Money): Money {
        this.assertSameCurrency(other);
        return new Money({
            amount: this.value.amount - other.value.amount,
            currency: this.value.currency,
        });
    }

    multiply(factor: bigint | number): Money {
        if (typeof factor === "number" && !Number.isInteger(factor)) {
            throw new DomainError({
                message: `The amount ${factor} is invalid; use an integer value for multiplication, or "applyPercentage" for percentages.`,
                code: ERROR_CODE.INVALID_AMOUNT,
            });
        }
        return new Money({
            amount: this.getAmount() * BigInt(factor),
            currency: this.getCurrency(),
        });
    }

    applyPercentage(percentage: Percentage, rounding: RoundingMode = "HALF_EVEN"): Money {
        const portion = percentage.of(this.getAmount(), rounding);
        return new Money({
            amount: this.getAmount() + portion,
            currency: this.getCurrency(),
        });
    }

    percentageOf(percentage: Percentage, rounding: RoundingMode = "HALF_EVEN"): Money {
        return new Money({
            amount: percentage.of(this.getAmount(), rounding),
            currency: this.getCurrency(),
        });
    }

    comparteTo(other: Money): -1 | 0 | 1 {
        this.assertSameCurrency(other);
        if (this.getAmount() < other.getAmount()) return -1;
        if (this.getAmount() > other.getAmount()) return 1;
        return 0;
    }

    isGreaterThan(other: Money): boolean {
        return this.comparteTo(other) === 1;
    }

    isLessThan(other: Money): boolean {
        return this.comparteTo(other) === -1;
    }

    isZero(): boolean {
        return this.value.amount === 0n;
    }

    isNegative(): boolean {
        return this.value.amount < 0n;
    }

    isPositive(): boolean {
        return this.value.amount > 0n;
    }

    getAmount(): bigint {
        return this.value.amount;
    }

    getCurrency(): Currency {
        return this.value.currency;
    }

    toCents(): bigint {
        return this.value.amount;
    }

    toDecimalString(): string {
        const abs = this.isNegative() ? -this.value.amount : this.value.amount;
        const digits = abs.toString().padStart(this.value.currency.getDecimals() + 1, "0");
        const intPart = digits.slice(0, digits.length - this.value.currency.getDecimals());
        const fracPart = digits.slice(digits.length - this.value.currency.getDecimals());
        return `${this.isNegative() ? "-" : ""}${intPart}.${fracPart}`;
    }

    format(): string {
        return this.value.currency.format(Number(this.toDecimalString()));
    }

    toString(): string {
        return `${this.getCurrency().getCode()} ${this.toDecimalString()}`;
    }

    override equals(other: ValueObject<MoneyProps>): boolean {
        return (
            this.value.amount === other.getValue().amount &&
            this.value.currency.getCode() === other.getValue().currency.getCode()
        );
    }

    private assertSameCurrency(other: Money) {
        if (this.value.currency !== other.getCurrency()) {
            throw new DomainError({
                message: `Currency "${other.getCurrency()}" must be the same as "${this.value.currency}"`,
                code: ERROR_CODE.INVALID_CURRENCY,
            });
        }
    }
}
