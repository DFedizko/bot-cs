import z from "zod";
import type { ToggleWantedItemInput } from "../../infrastructure/controllers/toggle-wanted-item.http-controller";
import { accountIdField, enabledField, itemNameField } from "./wanted-item.fields";

export const toggleWantedItemSchema = z.object({
    accountId: accountIdField,
    name: itemNameField,
    enabled: enabledField,
}) satisfies z.ZodType<ToggleWantedItemInput>;
