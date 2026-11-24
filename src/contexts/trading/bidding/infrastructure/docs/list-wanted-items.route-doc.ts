import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/infrastructure/http/docs/http-error.response-docs";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/packages/building-blocks/pagination";
import type { ListWantedItemsResponse } from "../../application/list-wanted-items/list-wanted-items.response";
import { MaxForType } from "../../domain/wanted-item/max-for/max-for";
import { WANTED_ITEMS_TAG } from "./wanted-items.tag";
import { WANTED_ITEM_EXAMPLE } from "./wanted-item.example";
import { ENABLED_FILTER_NOT_BOOLEAN, INVALID_ACCOUNT_ID, PAGE_SIZE_TOO_BIG } from "./wanted-item.error-examples";

const { name, maxPercentage, criterionType, wear } = WANTED_ITEM_EXAMPLE;

export const WANTED_ITEMS_PAGE: ListWantedItemsResponse = {
    items: [
        {
            name,
            maxFor: { type: MaxForType.PERCENTAGE, value: maxPercentage },
            criteria: [{ type: criterionType, value: wear }],
            enabled: true,
        },
    ],
    page: FIRST_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 1,
};

export const listWantedItemsDoc = (body: Validator<unknown>): HttpRouteDoc => ({
    summary: "List the wanted items",
    description:
        "Lists the items the account wants, a page at a time, in the order they were added, with each one's max for, criteria and enabled state. Filter by enabled state. An account that wants nothing, or that the bot doesn't know, gets an empty page.",
    tags: [WANTED_ITEMS_TAG],
    responses: [
        {
            status: HttpStatus.OK,
            description: "A page of the account's wanted items and how many there are in all",
            body,
            examples: { wantedItems: { summary: "An account that wants one item", value: WANTED_ITEMS_PAGE } },
        },
        HttpErrorResponseDocs.badQuery(INVALID_ACCOUNT_ID, PAGE_SIZE_TOO_BIG, ENABLED_FILTER_NOT_BOOLEAN),
        HttpErrorResponseDocs.internalError(),
    ],
});
