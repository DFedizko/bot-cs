import type { WantedItem } from "@/features/wanted-items/model/wanted-item";

const BASE_ITEM: WantedItem = {
    name: "AWP | Asiimov (Field-Tested)",
    maxFor: { type: "percentage", value: -3 },
    enabled: true,
    addedAt: "2026-11-20T14:03:00.000Z",
    catalog: null,
};

export const wantedItemBuilder = (overrides: Partial<WantedItem> = {}): WantedItem => ({ ...BASE_ITEM, ...overrides });
