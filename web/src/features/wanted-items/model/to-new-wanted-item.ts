import { coinsToCoinCents } from "./coins-to-coin-cents";
import type { MaxFor } from "./max-for";
import type { NewWantedItem } from "./new-wanted-item";
import { parsePercentage } from "./parse-percentage";
import { parseWholeCoins } from "./parse-whole-coins";
import type { WantedItemDraft } from "./wanted-item-draft";

const WEAR_CRITERION = "IsWear";
const NOTHING = 0;

const toMaxFor = ({ maxMode, percentage, value }: WantedItemDraft): MaxFor =>
    maxMode === "percentage"
        ? { type: "percentage", value: parsePercentage(percentage) ?? NOTHING }
        : { type: "value", value: coinsToCoinCents(parseWholeCoins(value) ?? NOTHING) };

export const toNewWantedItem = (name: string, draft: WantedItemDraft): NewWantedItem => ({
    name,
    maxFor: toMaxFor(draft),
    criteria: draft.wear ? [{ type: WEAR_CRITERION, value: draft.wear }] : [],
    enabled: draft.enabled,
});
