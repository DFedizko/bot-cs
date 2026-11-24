import z from "zod";
import type { QueryOptions } from "@/packages/building-blocks/query-options";
import { limitField, pageField, pageSizeField } from "./pagination.fields";

type SortKeys<TSort extends string> = readonly [TSort, ...TSort[]];

type OptionsConfig<TSort extends string, TFilters extends z.ZodRawShape> = {
    sort?: SortKeys<TSort>;
    filters?: TFilters;
    limit?: boolean;
};

type Fields = Record<string, unknown>;

export const sortField = <TSort extends string>(keys: SortKeys<TSort>) => {
    const description = `Sorts the items by ${keys.join(" or ")}`;
    return z
        .enum(keys)
        .meta({ description, examples: [keys[0]] })
        .optional()
        .meta({ description });
};

const nestFilters = (input: Fields, filterNames: string[]): Fields => {
    const entries = Object.entries(input);
    const filters = entries.filter(([name, value]) => filterNames.includes(name) && value !== undefined);
    const rest = entries.filter(([name]) => !filterNames.includes(name));
    return { ...Object.fromEntries(rest), ...(filters.length > 0 && { filters: Object.fromEntries(filters) }) };
};

export const queryOptionsSchema = <
    TFields extends z.ZodRawShape,
    const TSort extends string = never,
    TFilters extends z.ZodRawShape = Record<never, never>,
>(
    fields: TFields,
    { sort, filters, limit }: OptionsConfig<TSort, TFilters> = {},
) => {
    const filterNames = Object.keys(filters ?? {});
    return z
        .object({
            ...fields,
            page: pageField,
            pageSize: pageSizeField,
            ...(limit && { limit: limitField }),
            ...(sort && { sort: sortField(sort) }),
            ...filters,
        })
        .transform(
            (input) =>
                nestFilters(input, filterNames) as z.output<z.ZodObject<TFields>> &
                    QueryOptions<TSort, z.output<z.ZodObject<TFilters>>>,
        );
};
