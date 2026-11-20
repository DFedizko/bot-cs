// Shapes from steam-tradeoffer-manager 2.13 TradeOffer / CEconItem docs, checked 2026-11-20.
import type { SteamTradeSession } from "@/contexts/delivery/infrastructure/steam/steam-trade-session";
import {
    STEAM_OFFER_STATE,
    type SteamAcceptStatus,
    type SteamOfferState,
    type SteamTradeOffer,
} from "@/contexts/delivery/infrastructure/steam/steam-trade-offer";
import { SteamTradeError } from "@/contexts/delivery/infrastructure/steam/steam-trade.error";

export type SteamFakeScenario = { confirmationRequired?: boolean };

const NO_HOLD_DAYS = 0;

export class SteamTradeSessionFakeAdapter implements SteamTradeSession {
    private readonly store: Map<string, SteamTradeOffer>;
    private readonly awaitingConfirmation = new Set<string>();

    constructor(
        offers: readonly SteamTradeOffer[],
        private readonly scenario: SteamFakeScenario = {},
    ) {
        this.store = new Map(offers.map((offer) => [offer.id, structuredClone(offer)]));
    }

    async getReceivedActiveOffers(): Promise<SteamTradeOffer[]> {
        return [...this.store.values()]
            .filter((offer) => this.isReceivedActive(offer))
            .map((offer) => structuredClone(offer));
    }

    async acceptOffer(offerId: string): Promise<SteamAcceptStatus> {
        const offer = this.findActive(offerId);
        if (offer.escrowDays > NO_HOLD_DAYS) return this.moveTo(offer, STEAM_OFFER_STATE.IN_ESCROW, "escrow");
        if (!this.scenario.confirmationRequired) return this.moveTo(offer, STEAM_OFFER_STATE.ACCEPTED, "accepted");
        this.awaitingConfirmation.add(offerId);
        return "pending";
    }

    async cancelOffer(offerId: string): Promise<void> {
        this.moveTo(this.findActive(offerId), STEAM_OFFER_STATE.DECLINED, "accepted");
    }

    async confirmOffer(offerId: string): Promise<void> {
        if (!this.awaitingConfirmation.delete(offerId))
            throw new SteamTradeError(`Could not act on confirmation for offer ${offerId}`);
        this.moveTo(this.findActive(offerId), STEAM_OFFER_STATE.ACCEPTED, "accepted");
    }

    private findActive(offerId: string): SteamTradeOffer {
        const offer = this.store.get(offerId);
        if (!offer || offer.state !== STEAM_OFFER_STATE.ACTIVE)
            throw new SteamTradeError(`Offer #${offerId} is not active, so it may not be accepted`);
        return offer;
    }

    private isReceivedActive(offer: SteamTradeOffer): boolean {
        return offer.state === STEAM_OFFER_STATE.ACTIVE && !offer.isOurOffer;
    }

    private moveTo(offer: SteamTradeOffer, state: SteamOfferState, status: SteamAcceptStatus): SteamAcceptStatus {
        this.store.set(offer.id, { ...offer, state });
        return status;
    }
}
