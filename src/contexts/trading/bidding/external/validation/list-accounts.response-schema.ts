import z from "zod";
import type { ListAccountsBody } from "../../infrastructure/controllers/list-accounts.http-controller";
import { shownCurrencyField } from "./user-currency.field";
import { ACCOUNTS_LIST, MAIN_ACCOUNT } from "../../infrastructure/docs/accounts.example";

const PLAIN_DIGITS = /^\d+$/;
const { balance } = MAIN_ACCOUNT;

const coinCentsField = (description: string, example: number) =>
    z
        .number()
        .int()
        .meta({
            description: `${description}, in coin cents or in the minor units of the asked currency`,
            examples: [example],
        });

const balanceSchema = z
    .object({
        total: coinCentsField("Everything the account holds", balance.total),
        reserved: coinCentsField("What its open bids and trades hold back", balance.reserved),
        available: coinCentsField("What it can still bid with", balance.available),
    })
    .meta({ description: "The account's balance on CSGOEmpire", examples: [balance] });

const accountSchema = z
    .object({
        id: z
            .string()
            .regex(PLAIN_DIGITS)
            .meta({
                description: "The CSGOEmpire user id of the account, as the accountId of the account's routes",
                examples: [MAIN_ACCOUNT.id],
            }),
        name: z.string().meta({ description: "The name of the account", examples: [MAIN_ACCOUNT.name] }),
        balance: balanceSchema,
    })
    .meta({ examples: [MAIN_ACCOUNT] });

export const listAccountsResponseSchema = z
    .object({
        items: z
            .array(accountSchema)
            .meta({ description: "The accounts the bot trades for", examples: [ACCOUNTS_LIST.items] }),
        currency: shownCurrencyField,
    })
    .meta({ examples: [ACCOUNTS_LIST] }) satisfies z.ZodType<ListAccountsBody>;
