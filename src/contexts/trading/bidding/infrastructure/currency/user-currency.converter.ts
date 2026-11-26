import { COIN, EUR, GBP, USD } from "@/contexts/shared-kernel/domain/currencies";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import type { CurrencyConverter } from "@/contexts/trading/shared/domain/currency-converter";
import type { Currency } from "@/packages/domain-primitives/currency";
import { Money } from "@/packages/domain-primitives/money";
import { MaxForType, type MaxForPrimitives } from "../../domain/wanted-item/max-for/max-for";
import { DEFAULT_USER_CURRENCY, UserCurrency } from "./user-currency";
import type { MaxForInput } from "./max-for.input";

type Conversion = (money: Money) => Money;

type Exchange = {
    currency: Currency;
    fromCoin: Conversion;
    toCoin: Conversion;
};

export class UserCurrencyConverter {
    private readonly exchanges: Record<UserCurrency, Exchange>;

    constructor(converter: CurrencyConverter) {
        const keep: Conversion = (money) => money;
        this.exchanges = {
            [UserCurrency.COIN]: { currency: COIN, fromCoin: keep, toCoin: keep },
            [UserCurrency.USD]: {
                currency: USD,
                fromCoin: (coins) => converter.fromCoinToUsd(coins),
                toCoin: (dollars) => converter.fromUsdToCoin(dollars),
            },
            [UserCurrency.EUR]: {
                currency: EUR,
                fromCoin: (coins) => converter.fromCoinToEur(coins),
                toCoin: (euros) => converter.fromEurToCoin(euros),
            },
            [UserCurrency.GBP]: {
                currency: GBP,
                fromCoin: (coins) => converter.fromCoinToGbp(coins),
                toCoin: (pounds) => converter.fromGbpToCoin(pounds),
            },
        };
    }

    fromCoinCents(coinCents: number, currency: UserCurrency): number {
        return this.exchanges[currency].fromCoin(CoinCent(coinCents)).toCents();
    }

    toCoinCents(amount: number, currency: UserCurrency): number {
        const exchange = this.exchanges[currency];
        return exchange.toCoin(Money.fromCents({ amount, currency: exchange.currency })).toCents();
    }

    showMaxFor(maxFor: MaxForPrimitives, currency: UserCurrency): MaxForPrimitives {
        if (maxFor.type === MaxForType.PERCENTAGE) return maxFor;
        return { ...maxFor, value: this.fromCoinCents(maxFor.value, currency) };
    }

    readMaxFor(maxFor: MaxForInput): MaxForPrimitives {
        if (maxFor.type === MaxForType.PERCENTAGE) return maxFor;
        const { currency = DEFAULT_USER_CURRENCY, ...maxValue } = maxFor;
        return { ...maxValue, value: this.toCoinCents(maxValue.value, currency) };
    }
}
