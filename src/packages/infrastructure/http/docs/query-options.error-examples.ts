import { FIRST_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/packages/building-blocks/pagination";
import type { HttpErrorBody } from "../http-error.mapper";
import type { HttpExampleDoc } from "./http-route.doc";

type ValidationExample = HttpExampleDoc & { value: HttpErrorBody };

const VALIDATION_ERROR = "VALIDATION_ERROR";
const NOT_WHOLE_NUMBER = "Invalid string: must match pattern /^\\d+$/";
const OPTION_SEPARATOR = "|";

const validationExample = (summary: string, path: string, message: string): ValidationExample => ({
    summary,
    value: { code: VALIDATION_ERROR, message: `Invalid input: ${path}`, fields: [{ path, message }] },
});

const tooSmall = (min: number): string => `Too small: expected number to be >=${min}`;
const tooBig = (max: number): string => `Too big: expected number to be <=${max}`;

export const PAGE_NOT_WHOLE_NUMBER = validationExample("The page is not a whole number", "page", NOT_WHOLE_NUMBER);
export const PAGE_TOO_SMALL = validationExample("The page is below the first", "page", tooSmall(FIRST_PAGE));
export const PAGE_SIZE_NOT_WHOLE_NUMBER = validationExample(
    "The page size is not a whole number",
    "pageSize",
    NOT_WHOLE_NUMBER,
);
export const PAGE_SIZE_TOO_SMALL = validationExample(
    "The page size is below the min",
    "pageSize",
    tooSmall(MIN_PAGE_SIZE),
);
export const PAGE_SIZE_TOO_BIG = validationExample("The page size is above the max", "pageSize", tooBig(MAX_PAGE_SIZE));
export const LIMIT_NOT_WHOLE_NUMBER = validationExample("The limit is not a whole number", "limit", NOT_WHOLE_NUMBER);
export const LIMIT_TOO_SMALL = validationExample("The limit is below the min", "limit", tooSmall(MIN_PAGE_SIZE));
export const LIMIT_TOO_BIG = validationExample("The limit is above the max", "limit", tooBig(MAX_PAGE_SIZE));

export const unknownSort = (keys: readonly string[]): ValidationExample =>
    validationExample(
        "The sort key is not one the route offers",
        "sort",
        `Invalid option: expected one of ${keys.map((key) => `"${key}"`).join(OPTION_SEPARATOR)}`,
    );
