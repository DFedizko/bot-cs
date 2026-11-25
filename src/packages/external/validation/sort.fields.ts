import z from "zod";
import { SORT_ORDERS, type Sort, type SortOrder } from "@/packages/building-blocks/sort";

export type SortFields<TField extends string> = readonly [TField, ...TField[]];

type SortInput<TField extends string> = {
    sort?: TField;
    order?: SortOrder;
};

const ORDER_DESCRIPTION = "asc puts the lowest first, desc the highest first";

const describeField = <TField extends string>(fields: SortFields<TField>, defaultSort: Sort<TField>): string =>
    `The field to sort the items by: ${fields.join(" or ")} (default ${defaultSort.field})`;

const describeOrder = (defaultSort: Sort<string>): string => `${ORDER_DESCRIPTION} (default ${defaultSort.order})`;

export const sortParams = <TField extends string>(fields: SortFields<TField>, defaultSort: Sort<TField>) => {
    const fieldDescription = describeField(fields, defaultSort);
    const orderDescription = describeOrder(defaultSort);
    return {
        sort: z
            .enum(fields)
            .meta({ description: fieldDescription, examples: [defaultSort.field] })
            .optional()
            .meta({ description: fieldDescription }),
        order: z
            .enum(SORT_ORDERS)
            .meta({ description: orderDescription, examples: [defaultSort.order] })
            .optional()
            .meta({ description: orderDescription }),
    };
};

export const toSort = <TField extends string>(
    { sort, order }: SortInput<TField>,
    defaultSort: Sort<TField>,
): Sort<TField> => ({ field: sort ?? defaultSort.field, order: order ?? defaultSort.order });

export const sortSchema = <TField extends string>(fields: SortFields<TField>, defaultSort: Sort<TField>) =>
    z.object(sortParams(fields, defaultSort)).transform((input) => toSort(input, defaultSort));
