import { DomainError } from "@/packages/error/domain-error";
import { Currency } from "@/packages/domain-primitives/currency";
import { Money } from "@/packages/domain-primitives/money";
import { ExchangeRate } from "@/packages/domain-primitives/exchange-rate";

const EURO = Currency.create({ code: "EUR", decimals: 2 });
const DOLLAR = Currency.create({ code: "USD", decimals: 2 });
const POUND = Currency.create({ code: "GBP", decimals: 2 });
const YEN = Currency.create({ code: "JPY", decimals: 0 });
const EURO_IN_DOLLARS = "1.5";
const EURO_IN_POUNDS = "0.8";

const euros = (amount: number) => Money.fromCents({ amount, currency: EURO });
const dollars = (amount: number) => Money.fromCents({ amount, currency: DOLLAR });
const pounds = (amount: number) => Money.fromCents({ amount, currency: POUND });
const euroToDollar = () => ExchangeRate.of({ base: EURO, quote: DOLLAR, rate: EURO_IN_DOLLARS });
const euroToPound = () => ExchangeRate.of({ base: EURO, quote: POUND, rate: EURO_IN_POUNDS });

describe("ExchangeRate", () => {
    describe("convert", () => {
        it("Should convert the base currency into the quote currency", () => {
            const rate = euroToDollar();

            const converted = rate.convert(euros(1000));

            expect(converted).toEqual(dollars(1500));
        });

        it("Should round half up to the quote currency's minor unit", () => {
            const rate = euroToDollar();

            const converted = rate.convert(euros(1));

            expect(converted).toEqual(dollars(2));
        });

        it("Should round down below half of the quote currency's minor unit", () => {
            const rate = ExchangeRate.of({ base: EURO, quote: DOLLAR, rate: "1.4" });

            const converted = rate.convert(euros(1));

            expect(converted).toEqual(dollars(1));
        });

        it("Should scale between currencies with different minor units", () => {
            const rate = ExchangeRate.of({ base: EURO, quote: YEN, rate: "160" });

            const converted = rate.convert(euros(1050));

            expect(converted).toEqual(Money.fromCents({ amount: 1680, currency: YEN }));
        });

        it("Should reject money that is not in the base currency", () => {
            const rate = euroToDollar();

            const convert = () => rate.convert(pounds(1000));

            expect(convert).toThrow(DomainError);
        });
    });

    describe("invert", () => {
        it("Should convert the quote currency back into the base currency", () => {
            const rate = euroToDollar().invert();

            const converted = rate.convert(dollars(1500));

            expect(converted).toEqual(euros(1000));
        });

        it("Should divide exactly before rounding once", () => {
            const rate = ExchangeRate.of({ base: EURO, quote: DOLLAR, rate: "3" }).invert();

            const converted = rate.convert(dollars(2));

            expect(converted).toEqual(euros(1));
        });
    });

    describe("then", () => {
        it("Should chain two rates into one from the first base to the last quote", () => {
            const rate = euroToDollar().invert().then(euroToPound());

            const converted = rate.convert(dollars(1500));

            expect(converted).toEqual(pounds(800));
        });

        it("Should reject a rate that doesn't start where this one ends", () => {
            const chain = () => euroToDollar().then(euroToPound());

            expect(chain).toThrow(DomainError);
        });
    });

    describe("of", () => {
        it.each(["0", "-1.5", "a lot", ""])("Should reject the rate %p", (rate) => {
            const create = () => ExchangeRate.of({ base: EURO, quote: DOLLAR, rate });

            expect(create).toThrow(DomainError);
        });
    });
});
