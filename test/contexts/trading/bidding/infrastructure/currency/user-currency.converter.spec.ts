import { CurrencyConverter } from "@/contexts/trading/shared/domain/currency-converter";
import { UserCurrency } from "@/contexts/trading/bidding/infrastructure/currency/user-currency";
import { UserCurrencyConverter } from "@/contexts/trading/bidding/infrastructure/currency/user-currency.converter";

const HUNDRED_COINS = 10000;
const TEN_UNITS = 1000;

const converter = new UserCurrencyConverter(new CurrencyConverter());

describe("UserCurrencyConverter", () => {
    it.each([
        [UserCurrency.COIN, HUNDRED_COINS],
        [UserCurrency.USD, 6143],
        [UserCurrency.EUR, 5618],
        [UserCurrency.GBP, 4704],
    ])("Should show coin cents in %s minor units", (currency, expected) => {
        const shown = converter.fromCoinCents(HUNDRED_COINS, currency);

        expect(shown).toBe(expected);
    });

    it.each([
        [UserCurrency.COIN, TEN_UNITS],
        [UserCurrency.USD, 1628],
        [UserCurrency.EUR, 1780],
        [UserCurrency.GBP, 2126],
    ])("Should read %s minor units as coin cents", (currency, expected) => {
        const coinCents = converter.toCoinCents(TEN_UNITS, currency);

        expect(coinCents).toBe(expected);
    });
});
