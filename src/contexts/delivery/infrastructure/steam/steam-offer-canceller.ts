export interface SteamOfferCanceller {
    cancelOffer(offerId: string): Promise<void>;
}
