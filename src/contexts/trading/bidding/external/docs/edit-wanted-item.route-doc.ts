import type z from "zod";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpMethod } from "@/packages/infrastructure/http/http-method";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/external/openapi/http-error.response-docs";
import { EditWantedItemHttpController } from "../../infrastructure/controllers/edit-wanted-item.http-controller";
import { editWantedItemSchema } from "../validation/edit-wanted-item.schema";
import { WANTED_ITEMS_TAG } from "./wanted-items.tag";
import {
    BLANK_NAME,
    EMPTY_CHANGES,
    INVALID_ACCOUNT_ID,
    INVALID_MAX_FOR,
    INVALID_WEAR,
    NAME_OUT_OF_BOUNDS,
    NOT_WANTED,
    UNKNOWN_CRITERION,
} from "./wanted-item.error-examples";

export const editWantedItemRoute: HttpRouteDoc<z.ZodObject> = {
    method: HttpMethod.PATCH,
    path: EditWantedItemHttpController.PATH,
    summary: "Edit a wanted item",
    description:
        "Changes the max for, the criteria, or both, of an item the account wants. At least one of them must be given.",
    tags: [WANTED_ITEMS_TAG],
    input: editWantedItemSchema,
    responses: [
        { status: HttpStatus.OK, description: "The wanted item was changed" },
        HttpErrorResponseDocs.badRequest(INVALID_ACCOUNT_ID),
        HttpErrorResponseDocs.notFound(NOT_WANTED),
        HttpErrorResponseDocs.unprocessable(
            EMPTY_CHANGES,
            INVALID_MAX_FOR,
            UNKNOWN_CRITERION,
            INVALID_WEAR,
            BLANK_NAME,
            NAME_OUT_OF_BOUNDS,
        ),
        HttpErrorResponseDocs.internalError(),
    ],
};
