import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/infrastructure/http/docs/http-error.response-docs";
import { WANTED_ITEMS_TAG } from "./wanted-items.tag";
import { BLANK_NAME, ENABLED_NOT_BOOLEAN, NAME_OUT_OF_BOUNDS, NOT_WANTED } from "./wanted-item.error-examples";

export const toggleWantedItemDoc: HttpRouteDoc = {
    summary: "Enable or disable a wanted item",
    description:
        "Pauses the bidding on an item the account wants, or resumes it, without losing its max for and criteria.",
    tags: [WANTED_ITEMS_TAG],
    responses: [
        { status: HttpStatus.OK, description: "The wanted item was enabled or disabled" },
        HttpErrorResponseDocs.badRequest(ENABLED_NOT_BOOLEAN),
        HttpErrorResponseDocs.notFound(NOT_WANTED),
        HttpErrorResponseDocs.unprocessable(BLANK_NAME, NAME_OUT_OF_BOUNDS),
        HttpErrorResponseDocs.internalError(),
    ],
};
