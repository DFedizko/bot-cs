import { Currency } from "@/packages/domain-primitives/currency";

export const COIN = Currency.create({ code: "COIN", decimals: 2 });
export const USD = Currency.create({
    code: "USD",
    decimals: 2,
    locale: "en-US",
});
export const BRL = Currency.create({
    code: "BRL",
    decimals: 2,
    locale: "pt-BR",
});
export const EUR = Currency.create({
    code: "EUR",
    decimals: 2,
    locale: "de-DE",
});
export const GBP = Currency.create({
    code: "GBP",
    decimals: 2,
    locale: "en-GB",
});
