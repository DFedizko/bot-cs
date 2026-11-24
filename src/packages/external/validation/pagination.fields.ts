import z from "zod";
import type { Paginated } from "@/packages/building-blocks/paginated";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/packages/building-blocks/pagination";

const PLAIN_DIGITS = /^\d+$/;
const PAGE_DESCRIPTION = `The page to read, from ${FIRST_PAGE} (default ${FIRST_PAGE})`;
const PAGE_SIZE_DESCRIPTION = `How many items a page holds, from ${MIN_PAGE_SIZE} to ${MAX_PAGE_SIZE} (default ${DEFAULT_PAGE_SIZE})`;

export const pageField = z
    .string()
    .regex(PLAIN_DIGITS)
    .meta({ description: PAGE_DESCRIPTION, examples: [String(FIRST_PAGE)] })
    .transform(Number)
    .pipe(z.number().int().min(FIRST_PAGE))
    .optional()
    .meta({ description: PAGE_DESCRIPTION });

export const pageSizeField = z
    .string()
    .regex(PLAIN_DIGITS)
    .meta({ description: PAGE_SIZE_DESCRIPTION, examples: [String(DEFAULT_PAGE_SIZE)] })
    .transform(Number)
    .pipe(z.number().int().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE))
    .optional()
    .meta({ description: PAGE_SIZE_DESCRIPTION });

export const paginatedSchema = <TItem extends z.ZodType>(item: TItem, example: Paginated<z.output<TItem>>) =>
    z
        .object({
            items: z.array(item).meta({ description: "The items of the page", examples: [example.items] }),
            page: z
                .number()
                .int()
                .meta({ description: "The page read", examples: [example.page] }),
            pageSize: z
                .number()
                .int()
                .meta({ description: "How many items a page holds", examples: [example.pageSize] }),
            total: z
                .number()
                .int()
                .meta({ description: "How many items match, on every page", examples: [example.total] }),
        })
        .meta({ examples: [example] });
