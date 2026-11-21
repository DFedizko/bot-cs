import z from "zod";

const PLAIN_DIGITS = /^\d+$/;

export const accountIdField = z.string().regex(PLAIN_DIGITS).transform(Number).pipe(z.number().int().positive());

export const itemNameField = z.string();

export const maxForField = z.union([z.string(), z.number()]).transform(String);

export const criteriaField = z.array(z.object({ type: z.string(), value: z.string() }));
