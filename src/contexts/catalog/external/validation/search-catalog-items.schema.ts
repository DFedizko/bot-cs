import z from "zod";
import { MIN_PAGE_SIZE } from "@/packages/building-blocks/pagination";
import { CatalogSearch } from "../../domain/catalog-search/catalog-search";
import type { SearchCatalogItemsInput } from "../../infrastructure/controllers/search-catalog-items.http-controller";
import { SEARCH_LIMIT_EXAMPLE, SEARCH_TEXT_EXAMPLE } from "../../infrastructure/docs/catalog-item.example";

const PLAIN_DIGITS = /^\d+$/;
const TEXT_DESCRIPTION = `The text to search: every word must appear in the market name, case-insensitive (at least ${CatalogSearch.MIN_TEXT_LENGTH} characters)`;
const LIMIT_DESCRIPTION = `The most items to answer, from ${MIN_PAGE_SIZE} to ${CatalogSearch.MAX_LIMIT} (default ${CatalogSearch.DEFAULT_LIMIT})`;

const textField = z
    .string()
    .meta({ description: TEXT_DESCRIPTION, examples: [SEARCH_TEXT_EXAMPLE] })
    .trim()
    .min(CatalogSearch.MIN_TEXT_LENGTH);

const limitField = z
    .string()
    .regex(PLAIN_DIGITS)
    .meta({ description: LIMIT_DESCRIPTION, examples: [String(SEARCH_LIMIT_EXAMPLE)] })
    .transform(Number)
    .pipe(z.number().int().min(MIN_PAGE_SIZE).max(CatalogSearch.MAX_LIMIT))
    .optional()
    .meta({ description: LIMIT_DESCRIPTION });

export const searchCatalogItemsSchema = z.object({
    q: textField,
    limit: limitField,
}) satisfies z.ZodType<SearchCatalogItemsInput>;
