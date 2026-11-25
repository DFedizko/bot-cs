import { CatalogUnavailableError } from "../../application/search-catalog-items/catalog-unavailable.error";

const VALIDATION_ERROR = "VALIDATION_ERROR";

const validationExample = (summary: string, path: string, message: string) => ({
    summary,
    value: { code: VALIDATION_ERROR, message: `Invalid input: ${path}`, fields: [{ path, message }] },
});

export const TEXT_MISSING = validationExample(
    "The text to search is missing",
    "q",
    "Invalid input: expected string, received undefined",
);

export const TEXT_TOO_SHORT = validationExample(
    "The text is shorter than two characters",
    "q",
    "Too small: expected string to have >=2 characters",
);

export const LIMIT_NOT_WHOLE_NUMBER = validationExample(
    "The limit is not a whole number",
    "limit",
    "Invalid string: must match pattern /^\\d+$/",
);

export const LIMIT_TOO_SMALL = validationExample(
    "The limit is below one",
    "limit",
    "Too small: expected number to be >=1",
);

export const LIMIT_TOO_BIG = validationExample(
    "The limit is above the max",
    "limit",
    "Too big: expected number to be <=50",
);

export const CATALOG_UNAVAILABLE = {
    summary: "The catalog is still loading, or its last load failed",
    value: { code: CatalogUnavailableError.CODE, message: CatalogUnavailableError.MESSAGE },
};
