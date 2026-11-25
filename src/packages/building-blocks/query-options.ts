import type { Pagination } from "./pagination";
import type { Sort } from "./sort";

type SortOf<TSortField extends string> = [TSortField] extends [never] ? never : Sort<TSortField>;

export type QueryOptions<TSortField extends string = never, TFilters extends object = never> = Partial<Pagination> & {
    readonly limit?: number;
    readonly sort?: SortOf<TSortField>;
    readonly filters?: TFilters;
};
