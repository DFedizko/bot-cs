import z from "zod";
import type { QueryOptions } from "@/packages/building-blocks/query-options";
import type { Sort, SortOrder } from "@/packages/building-blocks/sort";
import { limitField, pageField, pageSizeField } from "./pagination.fields";
import { sortParams, toSort, type SortFields } from "./sort.fields";

type SortConfig<TSortField extends string> = {
    fields: SortFields<TSortField>;
    default: Sort<TSortField>;
};

type OptionsConfig<TSortField extends string, TFilters extends z.ZodRawShape> = {
    sort?: SortConfig<TSortField>;
    filters?: TFilters;
    limit?: boolean;
};

type Fields = Record<string, unknown>;

const ORDER_PARAM = "order";

type SortInput<TSortField extends string> = { sort?: TSortField; order?: SortOrder };

const nestFilters = (input: Fields, filterNames: string[]): Fields => {
    const entries = Object.entries(input);
    const filters = entries.filter(([name, value]) => filterNames.includes(name) && value !== undefined);
    const rest = entries.filter(([name]) => !filterNames.includes(name));
    return { ...Object.fromEntries(rest), ...(filters.length > 0 && { filters: Object.fromEntries(filters) }) };
};

const gatherSort = <TSortField extends string>(input: Fields, sort?: SortConfig<TSortField>): Fields => {
    if (!sort) return input;
    const rest = Object.entries(input).filter(([name]) => name !== ORDER_PARAM);
    return { ...Object.fromEntries(rest), sort: toSort(input as SortInput<TSortField>, sort.default) };
};

export const queryOptionsSchema = <
    TFields extends z.ZodRawShape,
    const TSortField extends string = never,
    TFilters extends z.ZodRawShape = Record<never, never>,
>(
    fields: TFields,
    { sort, filters, limit }: OptionsConfig<TSortField, TFilters> = {},
) => {
    const filterNames = Object.keys(filters ?? {});
    return z
        .object({
            ...fields,
            page: pageField,
            pageSize: pageSizeField,
            ...(limit && { limit: limitField }),
            ...(sort && sortParams(sort.fields, sort.default)),
            ...filters,
        })
        .transform(
            (input) =>
                nestFilters(gatherSort(input, sort), filterNames) as z.output<z.ZodObject<TFields>> &
                    QueryOptions<TSortField, z.output<z.ZodObject<TFilters>>>,
        );
};
