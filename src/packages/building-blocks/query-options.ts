import type { Pagination } from "./pagination";

export type QueryOptions<TSort extends string = never, TFilters extends object = never> = Partial<Pagination> & {
    readonly limit?: number;
    readonly sort?: TSort;
    readonly filters?: TFilters;
};
