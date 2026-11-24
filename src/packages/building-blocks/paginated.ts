import type { Pagination } from "./pagination";

export type Paginated<T> = Pagination & {
    readonly items: T[];
    readonly total: number;
};
