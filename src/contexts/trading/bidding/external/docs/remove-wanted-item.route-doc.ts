import type z from "zod";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpMethod } from "@/packages/infrastructure/http/http-method";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/external/openapi/http-error.response-docs";
import { RemoveWantedItemHttpController } from "../../infrastructure/controllers/remove-wanted-item.http-controller";
import { removeWantedItemSchema } from "../validation/remove-wanted-item.schema";
import { WANTED_ITEMS_TAG } from "./wanted-items.tag";
import { BLANK_NAME, INVALID_ACCOUNT_ID, NAME_OUT_OF_BOUNDS, NOT_WANTED } from "./wanted-item.error-examples";

export const removeWantedItemRoute: HttpRouteDoc<z.ZodObject> = {
    method: HttpMethod.DELETE,
    path: RemoveWantedItemHttpController.PATH,
    summary: "Remove a wanted item",
    description: "The account stops wanting the item and no longer bids on it.",
    tags: [WANTED_ITEMS_TAG],
    input: removeWantedItemSchema,
    responses: [
        { status: HttpStatus.OK, description: "The account no longer wants the item" },
        HttpErrorResponseDocs.badRequest(INVALID_ACCOUNT_ID),
        HttpErrorResponseDocs.notFound(NOT_WANTED),
        HttpErrorResponseDocs.unprocessable(BLANK_NAME, NAME_OUT_OF_BOUNDS),
        HttpErrorResponseDocs.internalError(),
    ],
};
