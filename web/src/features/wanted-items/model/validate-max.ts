import { parsePercentage } from "./parse-percentage";
import { parseWholeCoins } from "./parse-whole-coins";
import type { WantedItemDraft } from "./wanted-item-draft";

const LOWEST_PERCENTAGE = -100;
const HIGHEST_PERCENTAGE = 1000;
const PERCENTAGE_ERROR = "Enter a percentage, like −3";
const TOO_LOW_ERROR = "The max must be above −100%";
const TOO_HIGH_ERROR = "The max must be at most +1000%";
const VALUE_ERROR = "Enter a whole number of coins above zero";

const validatePercentage = (text: string) => {
    const percentage = parsePercentage(text);
    if (percentage === null) return PERCENTAGE_ERROR;
    if (percentage <= LOWEST_PERCENTAGE) return TOO_LOW_ERROR;
    return percentage > HIGHEST_PERCENTAGE ? TOO_HIGH_ERROR : null;
};

export const validateMax = ({ maxMode, percentage, value }: WantedItemDraft): string | null =>
    maxMode === "percentage" ? validatePercentage(percentage) : parseWholeCoins(value) === null ? VALUE_ERROR : null;
