const UNKNOWN_CURRENCY_MESSAGE = 'Invalid option: expected one of "COIN"|"USD"|"EUR"|"GBP"';

export const UNKNOWN_CURRENCY = {
    summary: "The currency is not one the bot shows",
    value: {
        code: "VALIDATION_ERROR",
        message: "Invalid input: currency",
        fields: [{ path: "currency", message: UNKNOWN_CURRENCY_MESSAGE }],
    },
};

export const UNKNOWN_MAX_CURRENCY = {
    summary: "The currency of the max value is not one the bot takes",
    value: {
        code: "VALIDATION_ERROR",
        message: "Invalid input: maxFor.currency",
        fields: [{ path: "maxFor.currency", message: UNKNOWN_CURRENCY_MESSAGE }],
    },
};
