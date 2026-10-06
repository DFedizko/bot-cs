import { Decimal } from "decimal.js";
import { DomainError } from "@/shared/error/domain-error";
import { ValueObject } from "@/shared/building-blocks/value-object";

export type RoundingMode = "HALF_EVEN" | "HALF_AWAY_FROM_ZERO";

const DECIMAL_ROUNDING = {
    HALF_EVEN: Decimal.ROUND_HALF_EVEN,
    HALF_AWAY_FROM_ZERO: Decimal.ROUND_HALF_UP,
} as const;

enum ERROR_CODE {
    INVALID_PERCENTAGE = "INVALID_PERCENTAGE",
    INVALID_VALUE = "INVALID_VALUE",
}

const PERCENT_PER_UNIT = 100;

export class Percentage extends ValueObject<Decimal> {
    protected constructor(value: Decimal) {
        super(value);
    }

    static fromPercent(percent: string): Percentage {
        return new Percentage(Percentage.parseDecimal(percent).div(PERCENT_PER_UNIT));
    }

    static fromFraction(fraction: string): Percentage {
        return new Percentage(Percentage.parseDecimal(fraction));
    }

    of(amount: number, rounding: RoundingMode = "HALF_EVEN"): number {
        const portion = new Decimal(amount.toString()).times(this.value).toDecimalPlaces(0, DECIMAL_ROUNDING[rounding]);
        return Number(portion.toFixed(0));
    }

    isPositive(): boolean {
        return this.value.greaterThan(0n);
    }

    isNegative(): boolean {
        return this.value.lessThan(0n);
    }

    isZero(): boolean {
        return this.value.isZero();
    }

    override equals(vo: Percentage): boolean {
        return this.value.equals(vo.value);
    }

    toFractionString(): string {
        return this.value.toString();
    }

    negate(): Percentage {
        return new Percentage(this.value.negated());
    }

    toPercentString(): string {
        return this.value.times(PERCENT_PER_UNIT).toString();
    }

    toString(): string {
        return `${this.toPercentString()}%`;
    }

    private static parseDecimal(value: string): Decimal {
        try {
            return new Decimal(value.trim());
        } catch {
            throw new DomainError({
                code: ERROR_CODE.INVALID_VALUE,
                message: `Invalid percentage/fraction: "${value}"`,
            });
        }
    }
}
