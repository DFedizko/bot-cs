import z from "zod";
import type { EditWantedItemInput } from "../../infrastructure/controllers/edit-wanted-item.http-controller";
import { accountIdField, criteriaField, itemNameField, maxForField } from "./wanted-item.fields";

export const editWantedItemSchema = z.object({
    accountId: accountIdField,
    name: itemNameField,
    maxFor: maxForField.optional(),
    criteria: criteriaField.optional(),
}) satisfies z.ZodType<EditWantedItemInput>;
