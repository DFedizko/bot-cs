import type { WantedItemDraft } from "@/features/wanted-items/model/wanted-item-draft";

const BASE_DRAFT: WantedItemDraft = {
    maxMode: "percentage",
    percentage: "-3",
    value: "",
    wear: "Field-Tested",
    enabled: true,
};

export const wantedItemDraftBuilder = (overrides: Partial<WantedItemDraft> = {}): WantedItemDraft => ({
    ...BASE_DRAFT,
    ...overrides,
});
