import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/infrastructure/http/docs/http-error.response-docs";
import { WANTED_ITEMS_TAG } from "./wanted-items.tag";
import {
    ALREADY_WANTED,
    BLANK_NAME,
    INVALID_MAX_FOR,
    INVALID_WEAR,
    MISSING_NAME,
    NAME_OUT_OF_BOUNDS,
    UNKNOWN_CRITERION,
} from "./wanted-item.error-examples";

export const addWantedItemDoc: HttpRouteDoc = {
    summary: "Add a wanted item",
    description:
        "The account starts bidding on new auctions of the item, up to its max for over the recommended price and only when the criteria match.",
    tags: [WANTED_ITEMS_TAG],
    responses: [
        { status: HttpStatus.OK, description: "The account now wants the item" },
        HttpErrorResponseDocs.badRequest(MISSING_NAME),
        HttpErrorResponseDocs.conflict(ALREADY_WANTED),
        HttpErrorResponseDocs.unprocessable(
            INVALID_MAX_FOR,
            UNKNOWN_CRITERION,
            INVALID_WEAR,
            BLANK_NAME,
            NAME_OUT_OF_BOUNDS,
        ),
        HttpErrorResponseDocs.internalError(),
    ],
};
