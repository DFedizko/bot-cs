import z from "zod";
import type { ToggleWantedItemInput } from "../../infrastructure/controllers/toggle-wanted-item.input";
import { accountIdField, itemNameField } from "./wanted-item.fields";

export const toggleWantedItemSchema = z.object({
    accountId: accountIdField,
    name: itemNameField,
    enabled: z.boolean(),
}) satisfies z.ZodType<ToggleWantedItemInput>;
