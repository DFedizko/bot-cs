import { ReceivedOffer, type ReceivedOfferProps } from "@/contexts/delivery/domain/offer-verification/received-offer";
import { CS_APP_ID } from "@/contexts/shared-kernel/domain/cs-app-id";
import { ASSET_ID, SELLER_STEAM_ID } from "./delivery.builder";

export const OFFER_ID = "6745123987";
export const OTHER_ASSET_ID = "34511548799";
export const OTHER_STEAM_ID = "76561198123456789";

export const expectedOfferItem = { assetId: ASSET_ID, appId: CS_APP_ID };

export const receivedOffer = (overrides: Partial<ReceivedOfferProps> = {}): ReceivedOffer =>
    ReceivedOffer.create({
        id: OFFER_ID,
        partnerSteamId: SELLER_STEAM_ID,
        isActive: true,
        isGlitched: false,
        escrowDays: 0,
        itemsToGive: [],
        itemsToReceive: [expectedOfferItem],
        ...overrides,
    });
