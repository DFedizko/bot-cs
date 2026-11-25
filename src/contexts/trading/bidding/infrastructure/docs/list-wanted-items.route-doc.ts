import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/infrastructure/http/docs/http-error.response-docs";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import {
    PAGE_NOT_WHOLE_NUMBER,
    PAGE_SIZE_TOO_BIG,
    PAGE_TOO_SMALL,
    unknownSort,
} from "@/packages/infrastructure/http/docs/query-options.error-examples";
import { WANTED_ITEMS_SORT_KEYS } from "../../application/list-wanted-items/list-wanted-items.query";
import { WANTED_ITEMS_TAG } from "./wanted-items.tag";
import { ENABLED_FILTER_NOT_BOOLEAN, INVALID_ACCOUNT_ID } from "./wanted-item.error-examples";
import { WANTED_ITEMS_PAGE } from "./wanted-items-page.example";

export const listWantedItemsDoc = (body: Validator<unknown>): HttpRouteDoc => ({
    summary: "List the wanted items",
    description: [
        "Lists the items the account wants, a page at a time, with each one's max for, criteria, enabled state, the time it was added and what the catalog knows of it (its picture, rarity, weapon, skin, wear, StatTrak™ and souvenir), or null when the catalog doesn't know it.",
        "Filter by enabled state. `counts` counts every item of the account, whatever the filter and the page.",
        "Sort by `recent` (the default, newest first), `name-asc`, `name-desc`, `max-asc`, `max-desc` (the percentage maxes first, then the fixed values, each from lowest to highest or the reverse) or `rarity` (Contraband down to Consumer Grade, the items without catalog details last). Items that tie stay newest first.",
        "An account that wants nothing, or that the bot doesn't know, gets an empty page.",
    ].join("\n\n"),
    tags: [WANTED_ITEMS_TAG],
    responses: [
        {
            status: HttpStatus.OK,
            description: "A page of the account's wanted items, how many match and how many the account has in all",
            body,
            examples: {
                wantedItems: {
                    summary: "The first page of an account that wants 47 items, 41 of them enabled",
                    value: WANTED_ITEMS_PAGE,
                },
            },
        },
        HttpErrorResponseDocs.badQuery(
            INVALID_ACCOUNT_ID,
            PAGE_NOT_WHOLE_NUMBER,
            PAGE_TOO_SMALL,
            PAGE_SIZE_TOO_BIG,
            unknownSort(WANTED_ITEMS_SORT_KEYS),
            ENABLED_FILTER_NOT_BOOLEAN,
        ),
        HttpErrorResponseDocs.internalError(),
    ],
});
