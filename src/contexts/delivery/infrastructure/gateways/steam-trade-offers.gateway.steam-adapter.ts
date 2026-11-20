import type {
    AcceptOutcome,
    OfferItemDTO,
    SteamTradeOffersGateway,
    TradeOfferDTO,
} from "../../application/accept-delivery-offer/steam-trade-offers.gateway";
import type { SteamCredentials } from "../../application/steam-credentials";
import type { SteamSessions } from "../steam/steam-sessions";
import {
    STEAM_OFFER_STATE,
    type SteamAcceptStatus,
    type SteamOfferState,
    type SteamEconItem,
    type SteamTradeOffer,
} from "../steam/steam-trade-offer";
import type { SteamTradeSession } from "../steam/steam-trade-session";

const OUTCOMES_BY_STATE: Partial<Record<SteamOfferState, AcceptOutcome>> = {
    [STEAM_OFFER_STATE.ACCEPTED]: "accepted",
    [STEAM_OFFER_STATE.IN_ESCROW]: "on_hold",
};

const ACCEPT_OUTCOMES: Record<SteamAcceptStatus, AcceptOutcome> = {
    accepted: "accepted",
    pending: "needs_confirmation",
    escrow: "on_hold",
};

export class SteamTradeOffersGatewaySteamAdapter implements SteamTradeOffersGateway {
    constructor(
        private readonly sessions: SteamSessions,
        private readonly credentials: SteamCredentials,
    ) {}

    async listReceivedActive(accountId: number): Promise<TradeOfferDTO[]> {
        const offers = await (await this.sessionOf(accountId)).getReceivedActiveOffers();
        return offers.map((offer) => this.mapToDto(offer));
    }

    async accept(accountId: number, offerId: string): Promise<AcceptOutcome> {
        const session = await this.sessionOf(accountId);
        try {
            return ACCEPT_OUTCOMES[await session.acceptOffer(offerId)];
        } catch (error) {
            return this.recoverAccept(session, offerId, error);
        }
    }

    async cancel(accountId: number, offerId: string): Promise<void> {
        await (await this.sessionOf(accountId)).cancelOffer(offerId);
    }

    async confirm(accountId: number, offerId: string): Promise<void> {
        await (await this.sessionOf(accountId)).confirmOffer(offerId);
    }

    private async recoverAccept(session: SteamTradeSession, offerId: string, error: unknown): Promise<AcceptOutcome> {
        const outcome = OUTCOMES_BY_STATE[await session.getOfferState(offerId)];
        if (!outcome) throw error;
        return outcome;
    }

    private async sessionOf(accountId: number): Promise<SteamTradeSession> {
        const { username, password, sharedSecret, identitySecret } = await this.credentials.forAccount(accountId);
        return this.sessions.sessionFor({ accountName: username, password, sharedSecret, identitySecret });
    }

    private mapToDto(offer: SteamTradeOffer): TradeOfferDTO {
        return {
            id: offer.id,
            partnerSteamId: offer.partner,
            isActive: offer.state === STEAM_OFFER_STATE.ACTIVE,
            isGlitched: offer.isGlitched,
            escrowDays: offer.escrowDays,
            itemsToGive: offer.itemsToGive.map((item) => this.mapItem(item)),
            itemsToReceive: offer.itemsToReceive.map((item) => this.mapItem(item)),
        };
    }

    private mapItem(item: SteamEconItem): OfferItemDTO {
        return { assetId: item.assetid, appId: item.appid };
    }
}
