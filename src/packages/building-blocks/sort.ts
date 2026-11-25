export const ASCENDING = "asc";
export const DESCENDING = "desc";
export const SORT_ORDERS = [ASCENDING, DESCENDING] as const;

export type SortOrder = (typeof SORT_ORDERS)[number];

export type Sort<TField extends string> = {
    readonly field: TField;
    readonly order: SortOrder;
};
