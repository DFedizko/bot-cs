import { WANTED_ITEM_EXAMPLE } from "./wanted-item.example";

const { accountId, name } = WANTED_ITEM_EXAMPLE;

export const ALREADY_WANTED = {
    summary: "The account already wants the item",
    value: { code: "WANTED_ITEM_ALREADY_EXISTS", message: `The account ${accountId} already wants "${name}"` },
};

export const NOT_WANTED = {
    summary: "The account doesn't want the item",
    value: { code: "WANTED_ITEM_NOT_FOUND", message: `The account ${accountId} doesn't want "${name}"` },
};

export const INVALID_MAX_PERCENTAGE = {
    summary: "The max percentage is not a number",
    value: { code: "INVALID_VALUE", message: 'Invalid percentage/fraction: "a lot"' },
};

export const NON_POSITIVE_MAX_VALUE = {
    summary: "The max value is not above zero",
    value: { code: "NON_POSITIVE_MAX_VALUE", message: 'The max value "0" must be above zero coin cents' },
};

export const UNKNOWN_CRITERION = {
    summary: "The criterion type is unknown",
    value: { code: "UNKNOWN_CRITERION", message: 'Unknown criterion: "IsShiny"' },
};

export const BLANK_NAME = {
    summary: "The item name is blank",
    value: { code: "EMPTY_STRING", message: "The value provided must not be empty" },
};

export const NAME_OUT_OF_BOUNDS = {
    summary: "The item name is too short or too long",
    value: { code: "DOMAIN_ERROR", message: 'The item name "A" must have between 2 and 100 characters' },
};

export const EMPTY_CHANGES = {
    summary: "The edit changes nothing",
    value: { code: "EMPTY_WANTED_ITEM_CHANGES", message: "A wanted item edit needs a max for or criteria" },
};

export const INVALID_ACCOUNT_ID = {
    summary: "The account id is not plain digits",
    value: {
        code: "VALIDATION_ERROR",
        message: "Invalid input: accountId",
        fields: [{ path: "accountId", message: "Invalid string: must match pattern /^\\d+$/" }],
    },
};

export const MISSING_NAME = {
    summary: "The item name is missing",
    value: {
        code: "VALIDATION_ERROR",
        message: "Invalid input: name",
        fields: [{ path: "name", message: "Invalid input: expected string, received undefined" }],
    },
};

export const ENABLED_NOT_BOOLEAN = {
    summary: "Enabled is not a boolean",
    value: {
        code: "VALIDATION_ERROR",
        message: "Invalid input: enabled",
        fields: [{ path: "enabled", message: "Invalid input: expected boolean, received string" }],
    },
};

export const INVALID_WEAR = {
    summary: "The wear is not a CS2 wear name",
    value: { code: "DOMAIN_ERROR", message: 'Invalid wear name: "Brand New"' },
};

export const ENABLED_FILTER_NOT_BOOLEAN = {
    summary: "The enabled filter is neither true nor false",
    value: {
        code: "VALIDATION_ERROR",
        message: "Invalid input: enabled",
        fields: [{ path: "enabled", message: 'Invalid option: expected one of "true"|"false"' }],
    },
};
