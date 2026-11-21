import type {
    OfferItemDTO,
    ReceivedOffersGateway,
    TradeOfferDTO,
} from "../../application/accept-delivery-offer/received-offers.gateway";
import {
    ACCEPT_OUTCOME,
    type AcceptOutcome,
    type OfferAcceptanceGateway,
} from "../../application/accept-delivery-offer/offer-acceptance.gateway";
import type { OfferConfirmationGateway } from "../../application/confirm-trade-offer/offer-confirmation.gateway";
import type { OfferCancellationGateway } from "../../application/cancel-trade-offer/offer-cancellation.gateway";
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
import type { SteamOfferStateReader } from "../steam/steam-offer-state-reader";
import type { SteamReceivedOffers } from "../steam/steam-received-offers";
import type { SteamOfferAcceptor } from "../steam/steam-offer-acceptor";
import type { SteamOfferCanceller } from "../steam/steam-offer-canceller";
import type { SteamOfferConfirmer } from "../steam/steam-offer-confirmer";

type SteamAcceptRoles = SteamOfferAcceptor & SteamOfferStateReader;

const OUTCOMES_BY_STATE: Partial<Record<SteamOfferState, AcceptOutcome>> = {
    [STEAM_OFFER_STATE.ACCEPTED]: ACCEPT_OUTCOME.ACCEPTED,
    [STEAM_OFFER_STATE.IN_ESCROW]: ACCEPT_OUTCOME.ON_HOLD,
};

const ACCEPT_OUTCOMES: Record<SteamAcceptStatus, AcceptOutcome> = {
    accepted: ACCEPT_OUTCOME.ACCEPTED,
    pending: ACCEPT_OUTCOME.NEEDS_CONFIRMATION,
    escrow: ACCEPT_OUTCOME.ON_HOLD,
};

export class SteamTradeOffersAdapter
    implements ReceivedOffersGateway, OfferAcceptanceGateway, OfferConfirmationGateway, OfferCancellationGateway
{
    constructor(
        private readonly sessions: SteamSessions,
        private readonly credentials: SteamCredentials,
    ) {}

    async listReceivedActive(accountId: number): Promise<TradeOfferDTO[]> {
        const session: SteamReceivedOffers = await this.sessionOf(accountId);
        const offers = await session.getReceivedActiveOffers();
        return offers.map((offer) => this.mapToDto(offer));
    }

    async accept(accountId: number, offerId: string): Promise<AcceptOutcome> {
        const session: SteamAcceptRoles = await this.sessionOf(accountId);
        try {
            return ACCEPT_OUTCOMES[await session.acceptOffer(offerId)];
        } catch (error) {
            return this.recoverAccept(session, offerId, error);
        }
    }

    async cancel(accountId: number, offerId: string): Promise<void> {
        const session: SteamOfferCanceller = await this.sessionOf(accountId);
        await session.cancelOffer(offerId);
    }

    async confirm(accountId: number, offerId: string): Promise<void> {
        const session: SteamOfferConfirmer = await this.sessionOf(accountId);
        await session.confirmOffer(offerId);
    }

    private async recoverAccept(
        session: SteamOfferStateReader,
        offerId: string,
        error: unknown,
    ): Promise<AcceptOutcome> {
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
