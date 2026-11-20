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

export type AcceptOutcome = "accepted" | "needs_confirmation" | "on_hold";

export interface SteamTradeOffersGateway {
    listReceivedActive(accountId: number): Promise<TradeOfferDTO[]>;
    accept(accountId: number, offerId: string): Promise<AcceptOutcome>;
    cancel(accountId: number, offerId: string): Promise<void>;
    confirm(accountId: number, offerId: string): Promise<void>;
}
