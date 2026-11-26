import z from "zod";
import { DEFAULT_USER_CURRENCY, UserCurrency } from "../../infrastructure/currency/user-currency";

const SHOW_IN_DESCRIPTION = `The currency to show every amount in, in its minor units (cents); leave it out for ${DEFAULT_USER_CURRENCY} cents`;

export const userCurrencyField = z.enum(UserCurrency).meta({
    description: "A currency the bot converts coin cents to and from",
    examples: [UserCurrency.USD],
});

export const shownCurrencyField = userCurrencyField.optional().meta({
    description: "The currency of every amount, in its minor units; only there when the request asks for a currency",
    examples: [UserCurrency.USD],
});

export const showInCurrencyField = userCurrencyField
    .meta({ description: SHOW_IN_DESCRIPTION, examples: [UserCurrency.USD] })
    .optional()
    .meta({ description: SHOW_IN_DESCRIPTION });
