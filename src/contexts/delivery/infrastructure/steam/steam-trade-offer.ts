export const STEAM_OFFER_STATE = {
    INVALID: 1,
    ACTIVE: 2,
    ACCEPTED: 3,
    COUNTERED: 4,
    EXPIRED: 5,
    CANCELED: 6,
    DECLINED: 7,
    INVALID_ITEMS: 8,
    CREATED_NEEDS_CONFIRMATION: 9,
    CANCELED_BY_SECOND_FACTOR: 10,
    IN_ESCROW: 11,
} as const;

export type SteamOfferState = (typeof STEAM_OFFER_STATE)[keyof typeof STEAM_OFFER_STATE];

export type SteamAcceptStatus = "pending" | "accepted" | "escrow";

export interface SteamEconItem {
    assetid: string;
    appid: number;
    contextid: string;
    classid: string;
    instanceid: string;
    amount: number;
    name: string;
    market_hash_name: string;
}

export interface SteamTradeOffer {
    id: string;
    partner: string;
    state: SteamOfferState;
    message: string;
    itemsToGive: SteamEconItem[];
    itemsToReceive: SteamEconItem[];
    isOurOffer: boolean;
    isGlitched: boolean;
    escrowDays: number;
}
