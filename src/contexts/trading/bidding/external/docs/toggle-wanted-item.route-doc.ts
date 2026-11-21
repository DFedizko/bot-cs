import type z from "zod";
import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpMethod } from "@/packages/infrastructure/http/http-method";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/external/openapi/http-error.response-docs";
import { ToggleWantedItemHttpController } from "../../infrastructure/controllers/toggle-wanted-item.http-controller";
import { toggleWantedItemSchema } from "../validation/toggle-wanted-item.schema";
import { WANTED_ITEMS_TAG } from "./wanted-items.tag";
import { BLANK_NAME, ENABLED_NOT_BOOLEAN, NAME_OUT_OF_BOUNDS, NOT_WANTED } from "./wanted-item.error-examples";

export const toggleWantedItemRoute: HttpRouteDoc<z.ZodObject> = {
    method: HttpMethod.PATCH,
    path: ToggleWantedItemHttpController.PATH,
    summary: "Enable or disable a wanted item",
    description:
        "Pauses the bidding on an item the account wants, or resumes it, without losing its max for and criteria.",
    tags: [WANTED_ITEMS_TAG],
    input: toggleWantedItemSchema,
    responses: [
        { status: HttpStatus.OK, description: "The wanted item was enabled or disabled" },
        HttpErrorResponseDocs.badRequest(ENABLED_NOT_BOOLEAN),
        HttpErrorResponseDocs.notFound(NOT_WANTED),
        HttpErrorResponseDocs.unprocessable(BLANK_NAME, NAME_OUT_OF_BOUNDS),
        HttpErrorResponseDocs.internalError(),
    ],
};
