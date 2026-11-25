import { WantedItem, type CreateWantedItemProps } from "@/contexts/trading/bidding/domain/wanted-item/wanted-item";

export const ADDED_AT = Date.parse("2026-11-20T14:03:00.000Z");

type WantedItemOverrides = Omit<CreateWantedItemProps, "addedAt"> & Partial<Pick<CreateWantedItemProps, "addedAt">>;

export const buildWantedItem = (overrides: WantedItemOverrides): WantedItem =>
    WantedItem.create({ addedAt: ADDED_AT, ...overrides });
