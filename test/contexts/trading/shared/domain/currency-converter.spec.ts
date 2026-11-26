import type { Currency } from "@/packages/domain-primitives/currency";
import { Money } from "@/packages/domain-primitives/money";
import { DomainError } from "@/packages/error/domain-error";
import { COIN, EUR, GBP, USD } from "@/contexts/shared-kernel/domain/currencies";
import { CoinCent } from "@/contexts/trading/shared/domain/coin-cent";
import { CurrencyConverter } from "@/contexts/trading/shared/domain/currency-converter";

const HUNDRED_COINS = 10000;
const TEN_UNITS = 1000;
const COIN_CENTS_ON_A_HALF = 625000;
const AMOUNTS = [1, 7, 99, 1000, 19400, 1248036, 9500000];
const ONE_COIN_CENT = 1;

const money = (amount: number, currency: Currency) => Money.fromCents({ amount, currency });

const converter = new CurrencyConverter();

describe("CurrencyConverter", () => {
    describe("Rates", () => {
        it.each([
            ["fromCoinToUsd", CoinCent(HUNDRED_COINS), money(6143, USD)],
            ["fromCoinToEur", CoinCent(HUNDRED_COINS), money(5618, EUR)],
            ["fromCoinToGbp", CoinCent(HUNDRED_COINS), money(4704, GBP)],
            ["fromUsdToCoin", money(TEN_UNITS, USD), CoinCent(1628)],
            ["fromEurToCoin", money(TEN_UNITS, EUR), CoinCent(1780)],
            ["fromGbpToCoin", money(TEN_UNITS, GBP), CoinCent(2126)],
        ] as const)("Should convert with %s", (method, amount, expected) => {
            const converted = converter[method](amount);

            expect(converted).toEqual(expected);
        });
    });

    describe("Rounding", () => {
        it("Should round half up to the target's minor unit", () => {
            const converted = converter.fromCoinToUsd(CoinCent(COIN_CENTS_ON_A_HALF));

            expect(converted).toEqual(money(383926, USD));
        });
    });

    describe("Round trips", () => {
        it.each([
            ["USD", "fromUsdToCoin", "fromCoinToUsd", USD],
            ["EUR", "fromEurToCoin", "fromCoinToEur", EUR],
            ["GBP", "fromGbpToCoin", "fromCoinToGbp", GBP],
        ] as const)(
            "Should give back the same %s amount after a trip through coins",
            (_code, toCoin, back, currency) => {
                const amounts = AMOUNTS.map((amount) => money(amount, currency));

                const tripped = amounts.map((amount) => converter[back](converter[toCoin](amount)));

                expect(tripped).toEqual(amounts);
            },
        );

        it.each([
            ["USD", "fromCoinToUsd", "fromUsdToCoin"],
            ["EUR", "fromCoinToEur", "fromEurToCoin"],
            ["GBP", "fromCoinToGbp", "fromGbpToCoin"],
        ] as const)("Should keep coins within one coin cent after a trip through %s", (_code, out, back) => {
            const coins = AMOUNTS.map(CoinCent);

            const drifts = coins.map((coin) =>
                Math.abs(converter[back](converter[out](coin)).toCents() - coin.toCents()),
            );

            expect(drifts.every((drift) => drift <= ONE_COIN_CENT)).toBe(true);
        });
    });

    describe("Currencies", () => {
        it("Should reject an amount that is not in the source currency", () => {
            const convert = () => converter.fromUsdToCoin(money(TEN_UNITS, COIN));

            expect(convert).toThrow(DomainError);
        });
    });
});
