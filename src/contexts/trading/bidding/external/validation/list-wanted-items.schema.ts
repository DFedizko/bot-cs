import z from "zod";
import { pageField, pageSizeField } from "@/packages/external/validation/pagination.fields";
import type { ListWantedItemsInput } from "../../infrastructure/controllers/list-wanted-items.input";
import { accountIdField, enabledFilterField } from "./wanted-item.fields";

export const listWantedItemsSchema = z.object({
    accountId: accountIdField,
    enabled: enabledFilterField,
    page: pageField,
    pageSize: pageSizeField,
}) satisfies z.ZodType<ListWantedItemsInput>;
