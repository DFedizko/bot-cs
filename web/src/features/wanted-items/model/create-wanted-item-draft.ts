import type { CatalogItem } from "./catalog-item";
import type { WantedItemDraft } from "./wanted-item-draft";

const DEFAULT_PERCENTAGE = "-3";

export const createWantedItemDraft = ({ wear }: CatalogItem): WantedItemDraft => ({
    maxMode: "percentage",
    percentage: DEFAULT_PERCENTAGE,
    value: "",
    wear,
    enabled: true,
});
