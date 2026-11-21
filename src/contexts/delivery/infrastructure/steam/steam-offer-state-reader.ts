import type { SteamOfferState } from "./steam-trade-offer";

export interface SteamOfferStateReader {
    getOfferState(offerId: string): Promise<SteamOfferState>;
}
