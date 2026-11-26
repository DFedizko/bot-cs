import type { MaxMode } from "./max-mode";
import type { Wear } from "./wear";

export type WantedItemDraft = {
    maxMode: MaxMode;
    percentage: string;
    value: string;
    wear: Wear | null;
    enabled: boolean;
};
