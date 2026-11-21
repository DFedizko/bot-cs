export interface SteamOfferConfirmer {
    confirmOffer(offerId: string): Promise<void>;
}
