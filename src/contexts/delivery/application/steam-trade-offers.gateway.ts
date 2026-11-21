export type OfferItemDTO = { assetId: string; appId: number };

export type TradeOfferDTO = {
    id: string;
    partnerSteamId: string;
    isActive: boolean;
    isGlitched: boolean;
    escrowDays: number;
    itemsToGive: OfferItemDTO[];
    itemsToReceive: OfferItemDTO[];
};

export const ACCEPT_OUTCOME = {
    ACCEPTED: "accepted",
    NEEDS_CONFIRMATION: "needs_confirmation",
    ON_HOLD: "on_hold",
} as const;

export type AcceptOutcome = (typeof ACCEPT_OUTCOME)[keyof typeof ACCEPT_OUTCOME];

export interface SteamTradeOffersGateway {
    listReceivedActive(accountId: number): Promise<TradeOfferDTO[]>;
    accept(accountId: number, offerId: string): Promise<AcceptOutcome>;
    cancel(accountId: number, offerId: string): Promise<void>;
    confirm(accountId: number, offerId: string): Promise<void>;
}
