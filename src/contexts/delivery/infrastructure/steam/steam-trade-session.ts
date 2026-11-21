import type { SteamOfferAcceptor } from "./steam-offer-acceptor";
import type { SteamOfferCanceller } from "./steam-offer-canceller";
import type { SteamOfferConfirmer } from "./steam-offer-confirmer";
import type { SteamOfferStateReader } from "./steam-offer-state-reader";
import type { SteamReceivedOffers } from "./steam-received-offers";

export interface SteamTradeSession
    extends SteamReceivedOffers, SteamOfferStateReader, SteamOfferAcceptor, SteamOfferCanceller, SteamOfferConfirmer {}
