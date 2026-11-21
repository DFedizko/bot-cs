import z from "zod";
import type { RemoveWantedItemInput } from "../../infrastructure/controllers/remove-wanted-item.input";
import { accountIdField, itemNameField } from "./wanted-item.fields";

export const removeWantedItemSchema = z.object({
    accountId: accountIdField,
    name: itemNameField,
}) satisfies z.ZodType<RemoveWantedItemInput>;
