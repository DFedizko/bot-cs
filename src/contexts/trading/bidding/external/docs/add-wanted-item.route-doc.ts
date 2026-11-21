import type z from "zod";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpMethod } from "@/packages/infrastructure/http/http-method";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/external/openapi/http-error.response-docs";
import { AddWantedItemHttpController } from "../../infrastructure/controllers/add-wanted-item.http-controller";
import { addWantedItemSchema } from "../validation/add-wanted-item.schema";
import { WANTED_ITEMS_TAG } from "./wanted-items.tag";
import {
    ALREADY_WANTED,
    BLANK_NAME,
    INVALID_MAX_FOR,
    MISSING_NAME,
    NAME_OUT_OF_BOUNDS,
    UNKNOWN_CRITERION,
} from "./wanted-item.error-examples";

export const addWantedItemRoute: HttpRouteDoc<z.ZodObject> = {
    method: HttpMethod.POST,
    path: AddWantedItemHttpController.PATH,
    summary: "Add a wanted item",
    description:
        "The account starts bidding on new auctions of the item, up to its max for over the recommended price and only when the criteria match.",
    tags: [WANTED_ITEMS_TAG],
    input: addWantedItemSchema,
    responses: [
        { status: HttpStatus.OK, description: "The account now wants the item" },
        HttpErrorResponseDocs.badRequest(MISSING_NAME),
        HttpErrorResponseDocs.conflict(ALREADY_WANTED),
        HttpErrorResponseDocs.unprocessable(INVALID_MAX_FOR, UNKNOWN_CRITERION, BLANK_NAME, NAME_OUT_OF_BOUNDS),
        HttpErrorResponseDocs.internalError(),
    ],
};
