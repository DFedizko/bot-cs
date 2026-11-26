import { Decimal } from "decimal.js";
import { DomainError } from "@/packages/error/domain-error";
import { ValueObject } from "@/packages/building-blocks/value-object";
import { Money } from "./money";
import type { Currency } from "./currency";

enum ERROR_CODE {
    INVALID_EXCHANGE_RATE = "INVALID_EXCHANGE_RATE",
    INVALID_CURRENCY = "INVALID_CURRENCY",
}

type ExchangeRateProps = {
    base: Currency;
    quote: Currency;
    numerator: Decimal;
    denominator: Decimal;
};

type CreateExchangeRateProps = {
    base: Currency;
    quote: Currency;
    rate: string;
};

const DECIMAL_BASE = 10;
const UNIT = 1;

export class ExchangeRate extends ValueObject<ExchangeRateProps> {
    static readonly HALF_UP_TO_MINOR_UNIT = Decimal.ROUND_HALF_UP;

    private constructor(value: ExchangeRateProps) {
        super(value);
    }

    static of({ base, quote, rate }: CreateExchangeRateProps): ExchangeRate {
        const numerator = ExchangeRate.parseRate(rate);
        return new ExchangeRate({ base, quote, numerator, denominator: new Decimal(UNIT) });
    }

    private static parseRate(rate: string): Decimal {
        const parsed = ExchangeRate.tryParse(rate);
        if (!parsed?.isPositive() || parsed.isZero()) {
            throw new DomainError({
                message: `Invalid exchange rate: "${rate}", it must be a number above zero`,
                code: ERROR_CODE.INVALID_EXCHANGE_RATE,
            });
        }
        return parsed;
    }

    private static tryParse(rate: string): Decimal | null {
        try {
            return new Decimal(rate.trim());
        } catch {
            return null;
        }
    }

    convert(money: Money): Money {
        this.assertCurrency(money.getCurrency(), this.value.base);
        const { base, quote, numerator, denominator } = this.value;
        const amount = new Decimal(money.getAmount())
            .times(numerator)
            .times(ExchangeRate.minorUnitsOf(quote))
            .div(denominator.times(ExchangeRate.minorUnitsOf(base)))
            .toDecimalPlaces(0, ExchangeRate.HALF_UP_TO_MINOR_UNIT);
        return Money.fromCents({ amount: amount.toNumber(), currency: quote });
    }

    private assertCurrency(actual: Currency, expected: Currency): void {
        if (actual.getCode() !== expected.getCode()) {
            throw new DomainError({
                message: `Expected an amount in "${expected.getCode()}", got "${actual.getCode()}"`,
                code: ERROR_CODE.INVALID_CURRENCY,
            });
        }
    }

    private static minorUnitsOf(currency: Currency): Decimal {
        return new Decimal(DECIMAL_BASE).pow(currency.getDecimals());
    }

    invert(): ExchangeRate {
        const { base, quote, numerator, denominator } = this.value;
        return new ExchangeRate({ base: quote, quote: base, numerator: denominator, denominator: numerator });
    }

    then(next: ExchangeRate): ExchangeRate {
        this.assertCurrency(next.value.base, this.value.quote);
        return new ExchangeRate({
            base: this.value.base,
            quote: next.value.quote,
            numerator: this.value.numerator.times(next.value.numerator),
            denominator: this.value.denominator.times(next.value.denominator),
        });
    }
}
