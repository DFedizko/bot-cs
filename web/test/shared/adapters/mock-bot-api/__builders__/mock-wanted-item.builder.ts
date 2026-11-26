import type { MockWantedItem } from "@/shared/adapters/mock-bot-api/mock-wanted-item";

const BASE_ITEM: MockWantedItem = {
    name: "AWP | Asiimov (Field-Tested)",
    maxFor: { type: "percentage", value: "-3" },
    criteria: [],
    enabled: true,
    addedAt: "2026-11-20T14:03:00.000Z",
    catalog: null,
};

export const mockWantedItemBuilder = (overrides: Partial<MockWantedItem> = {}): MockWantedItem => ({
    ...BASE_ITEM,
    ...overrides,
});
