import z from "zod";

export const accountIdField = z.coerce.number().int().positive();

export const itemNameField = z.string();

export const maxForField = z.union([z.string(), z.number()]).transform(String);

export const criteriaField = z.array(z.object({ type: z.string(), value: z.string() }));
