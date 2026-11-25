import { MAX_PAGE_SIZE } from "@/packages/building-blocks/pagination";
import { queryOptionsSchema } from "@/packages/external/validation/query-options.schema";
import { ValidatorZodAdapter } from "@/packages/external/validation/validator.zod-adapter";
import { ValidationError } from "@/packages/infrastructure/validation/validation.error";
import {
    LIMIT_NOT_WHOLE_NUMBER,
    LIMIT_TOO_BIG,
    LIMIT_TOO_SMALL,
    PAGE_NOT_WHOLE_NUMBER,
    PAGE_SIZE_NOT_WHOLE_NUMBER,
    PAGE_SIZE_TOO_BIG,
    PAGE_SIZE_TOO_SMALL,
    PAGE_TOO_SMALL,
    INVALID_SORT_ORDER,
    unknownSortField,
} from "@/packages/infrastructure/http/docs/query-options.error-examples";

const SORT_KEYS = ["name", "size"] as const;
const ONLY_KEY = "name";
const DEFAULT_SORT = { field: ONLY_KEY, order: "asc" } as const;
const validator = new ValidatorZodAdapter(
    queryOptionsSchema({}, { sort: { fields: SORT_KEYS, default: DEFAULT_SORT }, limit: true }),
);

const answerTo = (input: Record<string, string>): unknown => {
    try {
        validator.validate(input);
        return undefined;
    } catch (error: unknown) {
        const { code, message, fields } = error as ValidationError;
        return { code, message, fields };
    }
};

describe("Query options error examples", () => {
    it.each([
        ["a page that is not a whole number", { page: "first" }, PAGE_NOT_WHOLE_NUMBER],
        ["a page below the first", { page: "0" }, PAGE_TOO_SMALL],
        ["a page size that is not a whole number", { pageSize: "ten" }, PAGE_SIZE_NOT_WHOLE_NUMBER],
        ["a page size below the min", { pageSize: "0" }, PAGE_SIZE_TOO_SMALL],
        ["a page size above the max", { pageSize: String(MAX_PAGE_SIZE + 1) }, PAGE_SIZE_TOO_BIG],
        ["a limit that is not a whole number", { limit: "all" }, LIMIT_NOT_WHOLE_NUMBER],
        ["a limit below the min", { limit: "0" }, LIMIT_TOO_SMALL],
        ["a limit above the max", { limit: String(MAX_PAGE_SIZE + 1) }, LIMIT_TOO_BIG],
        ["a sort field the query doesn't offer", { sort: "weight" }, unknownSortField(SORT_KEYS)],
        ["an order that is neither asc nor desc", { order: "up" }, INVALID_SORT_ORDER],
    ])("Should match the real answer to %s", (_case, input, example) => {
        const answer = answerTo(input);

        expect(answer).toEqual(example.value);
    });

    it("Should match the real answer to an unknown sort field when the query offers one", () => {
        const oneField = new ValidatorZodAdapter(
            queryOptionsSchema({}, { sort: { fields: [ONLY_KEY], default: DEFAULT_SORT } }),
        );

        const throwing = () => oneField.validate({ sort: "weight" });

        expect(throwing).toThrow(expect.objectContaining({ fields: unknownSortField([ONLY_KEY]).value.fields }));
    });
});
