import { COIN, EUR, GBP, USD } from "@/contexts/shared-kernel/domain/currencies";
import { ExchangeRate } from "@/packages/domain-primitives/exchange-rate";
import type { Money } from "@/packages/domain-primitives/money";

export class CurrencyConverter {
    static readonly USD_PER_COIN = "0.6142808";
    static readonly USD_PER_EUR = "1.0935";
    static readonly GBP_PER_EUR = "0.83730";

    private static readonly COIN_TO_USD = ExchangeRate.of({
        base: COIN,
        quote: USD,
        rate: CurrencyConverter.USD_PER_COIN,
    });
    private static readonly USD_TO_EUR = ExchangeRate.of({
        base: EUR,
        quote: USD,
        rate: CurrencyConverter.USD_PER_EUR,
    }).invert();
    private static readonly EUR_TO_GBP = ExchangeRate.of({
        base: EUR,
        quote: GBP,
        rate: CurrencyConverter.GBP_PER_EUR,
    });
    private static readonly COIN_TO_EUR = CurrencyConverter.COIN_TO_USD.then(CurrencyConverter.USD_TO_EUR);
    private static readonly COIN_TO_GBP = CurrencyConverter.COIN_TO_EUR.then(CurrencyConverter.EUR_TO_GBP);

    fromCoinToUsd(coins: Money): Money {
        return CurrencyConverter.COIN_TO_USD.convert(coins);
    }

    fromUsdToCoin(dollars: Money): Money {
        return CurrencyConverter.COIN_TO_USD.invert().convert(dollars);
    }

    fromCoinToEur(coins: Money): Money {
        return CurrencyConverter.COIN_TO_EUR.convert(coins);
    }

    fromEurToCoin(euros: Money): Money {
        return CurrencyConverter.COIN_TO_EUR.invert().convert(euros);
    }

    fromCoinToGbp(coins: Money): Money {
        return CurrencyConverter.COIN_TO_GBP.convert(coins);
    }

    fromGbpToCoin(pounds: Money): Money {
        return CurrencyConverter.COIN_TO_GBP.invert().convert(pounds);
    }
}
