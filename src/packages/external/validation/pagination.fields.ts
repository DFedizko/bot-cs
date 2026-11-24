import z from "zod";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, MAX_PAGE_SIZE } from "@/packages/building-blocks/pagination";

const PLAIN_DIGITS = /^\d+$/;
const PAGE_DESCRIPTION = `The page to read, from ${FIRST_PAGE} (default ${FIRST_PAGE})`;
const PAGE_SIZE_DESCRIPTION = `How many items a page holds, from 1 to ${MAX_PAGE_SIZE} (default ${DEFAULT_PAGE_SIZE})`;

export const pageField = z
    .string()
    .regex(PLAIN_DIGITS)
    .meta({ description: PAGE_DESCRIPTION, examples: [String(FIRST_PAGE)] })
    .transform(Number)
    .pipe(z.number().int().min(FIRST_PAGE));

export const pageSizeField = z
    .string()
    .regex(PLAIN_DIGITS)
    .meta({ description: PAGE_SIZE_DESCRIPTION, examples: [String(DEFAULT_PAGE_SIZE)] })
    .transform(Number)
    .pipe(z.number().int().min(1).max(MAX_PAGE_SIZE));
