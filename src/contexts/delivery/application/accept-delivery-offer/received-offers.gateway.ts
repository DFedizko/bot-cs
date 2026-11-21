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

export interface ReceivedOffersGateway {
    listReceivedActive(accountId: number): Promise<TradeOfferDTO[]>;
}
