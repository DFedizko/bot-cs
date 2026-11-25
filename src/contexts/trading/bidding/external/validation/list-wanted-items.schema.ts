import type z from "zod";
import { queryOptionsSchema } from "@/packages/external/validation/query-options.schema";
import {
    DEFAULT_WANTED_ITEMS_SORT,
    WANTED_ITEMS_SORT_FIELDS,
} from "../../application/list-wanted-items/list-wanted-items.query";
import type { ListWantedItemsInput } from "../../infrastructure/controllers/list-wanted-items.http-controller";
import { accountIdField, enabledFilterField } from "./wanted-item.fields";

export const listWantedItemsSchema = queryOptionsSchema(
    { accountId: accountIdField },
    {
        sort: { fields: WANTED_ITEMS_SORT_FIELDS, default: DEFAULT_WANTED_ITEMS_SORT },
        filters: { enabled: enabledFilterField },
    },
) satisfies z.ZodType<ListWantedItemsInput>;
