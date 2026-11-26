import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/infrastructure/http/docs/http-error.response-docs";
import { WANTED_ITEMS_TAG } from "./wanted-items.tag";
import {
    ALREADY_WANTED,
    BLANK_NAME,
    INVALID_MAX_PERCENTAGE,
    INVALID_WEAR,
    MISSING_NAME,
    NAME_TOO_LONG,
    NON_POSITIVE_MAX_VALUE,
    UNKNOWN_CRITERION,
} from "./wanted-item.error-examples";
import { UNKNOWN_MAX_CURRENCY } from "./currency.error-examples";

export const addWantedItemDoc: HttpRouteDoc = {
    summary: "Add a wanted item",
    description:
        "The account starts bidding on new auctions of the item, only when the criteria match and up to its max for: either a percentage over the recommended price or a fixed value, never both. A fixed value is in coin cents, or in the minor units (cents) of its `currency` (`USD`, `EUR` or `GBP`), which the bot converts to coin cents at fixed rates before storing it.",
    tags: [WANTED_ITEMS_TAG],
    responses: [
        { status: HttpStatus.OK, description: "The account now wants the item" },
        HttpErrorResponseDocs.badRequest(MISSING_NAME, UNKNOWN_MAX_CURRENCY),
        HttpErrorResponseDocs.conflict(ALREADY_WANTED),
        HttpErrorResponseDocs.unprocessable(
            INVALID_MAX_PERCENTAGE,
            NON_POSITIVE_MAX_VALUE,
            UNKNOWN_CRITERION,
            INVALID_WEAR,
            BLANK_NAME,
            NAME_TOO_LONG,
        ),
        HttpErrorResponseDocs.internalError(),
    ],
};
