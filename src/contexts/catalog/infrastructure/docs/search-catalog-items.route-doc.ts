import type { HttpRouteDoc } from "@/packages/infrastructure/http/docs/http-route.doc";
import { HttpStatus } from "@/packages/infrastructure/http/http-status";
import { HttpErrorResponseDocs } from "@/packages/infrastructure/http/docs/http-error.response-docs";
import type { Validator } from "@/packages/infrastructure/validation/validator";
import type { CatalogItemsBody } from "../controllers/catalog-items.http-body";
import { CATALOG_TAG } from "./catalog.tag";
import { CATALOG_ITEM_EXAMPLE } from "./catalog-item.example";
import {
    CATALOG_UNAVAILABLE,
    LIMIT_NOT_WHOLE_NUMBER,
    LIMIT_TOO_BIG,
    LIMIT_TOO_SMALL,
    TEXT_MISSING,
    TEXT_TOO_SHORT,
} from "./catalog.error-examples";

export const CATALOG_ITEMS_FOUND: CatalogItemsBody = {
    items: [
        CATALOG_ITEM_EXAMPLE,
        {
            ...CATALOG_ITEM_EXAMPLE,
            marketHashName: "StatTrak™ AWP | Asiimov (Field-Tested)",
            stattrak: true,
        },
    ],
};

export const searchCatalogItemsDoc = (body: Validator<unknown>): HttpRouteDoc => ({
    summary: "Search the catalog of CS2 items",
    description:
        "Finds the CS2 items whose market name holds every word of the text, ignoring case, bars and parentheses, with each item's picture and rarity. Names that start with the text come first, then the rest, each group alphabetical. The market name is the one a wanted item uses. The catalog loads when the bot starts; until it is loaded the route answers 503.",
    tags: [CATALOG_TAG],
    responses: [
        {
            status: HttpStatus.OK,
            description: "The matching catalog items, at most the asked limit",
            body,
            examples: { asiimov: { summary: "Searching for an AWP Asiimov", value: CATALOG_ITEMS_FOUND } },
        },
        HttpErrorResponseDocs.badQuery(
            TEXT_MISSING,
            TEXT_TOO_SHORT,
            LIMIT_NOT_WHOLE_NUMBER,
            LIMIT_TOO_SMALL,
            LIMIT_TOO_BIG,
        ),
        HttpErrorResponseDocs.serviceUnavailable(CATALOG_UNAVAILABLE),
        HttpErrorResponseDocs.internalError(),
    ],
});
