import type z from "zod";
import { queryOptionsSchema } from "@/packages/external/validation/query-options.schema";
import { WANTED_ITEMS_SORT_KEYS } from "../../application/list-wanted-items/list-wanted-items.query";
import type { ListWantedItemsInput } from "../../infrastructure/controllers/list-wanted-items.http-controller";
import { accountIdField, enabledFilterField } from "./wanted-item.fields";

export const listWantedItemsSchema = queryOptionsSchema(
    { accountId: accountIdField },
    { sort: WANTED_ITEMS_SORT_KEYS, filters: { enabled: enabledFilterField } },
) satisfies z.ZodType<ListWantedItemsInput>;
