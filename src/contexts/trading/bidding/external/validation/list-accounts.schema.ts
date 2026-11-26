import z from "zod";
import type { ListAccountsInput } from "../../infrastructure/controllers/list-accounts.http-controller";
import { showInCurrencyField } from "./user-currency.field";

export const listAccountsSchema = z.object({
    currency: showInCurrencyField,
}) satisfies z.ZodType<ListAccountsInput>;
