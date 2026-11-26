import { ArrowDownAZ, ArrowDownZA, Clock, Gem, Percent } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WantedItemsSort } from "../../model/wanted-items-sort";

export const SORT_ICONS: Readonly<Record<WantedItemsSort, LucideIcon>> = {
    recent: Clock,
    "name-asc": ArrowDownAZ,
    "name-desc": ArrowDownZA,
    "max-asc": Percent,
    "max-desc": Percent,
    rarity: Gem,
};
