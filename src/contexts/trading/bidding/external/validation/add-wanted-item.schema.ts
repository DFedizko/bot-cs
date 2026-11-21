import z from "zod";
import type { AddWantedItemInput } from "../../infrastructure/controllers/add-wanted-item.input";
import { accountIdField, criteriaField, itemNameField, maxForField } from "./wanted-item.fields";

export const addWantedItemSchema = z.object({
    accountId: accountIdField,
    name: itemNameField,
    maxFor: maxForField,
    criteria: criteriaField.optional(),
}) satisfies z.ZodType<AddWantedItemInput>;
