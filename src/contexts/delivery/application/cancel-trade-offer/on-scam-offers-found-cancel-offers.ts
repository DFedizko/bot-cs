import type { EventListener } from "@/packages/application/event-listener";
import { type ScamOffer, ScamOffersFoundEvent } from "../accept-delivery-offer/scam-offers-found.event";
import type { DeliveryStepDispatcher } from "../delivery-step-dispatcher";
import { CancelTradeOfferCommand } from "./cancel-trade-offer.command";

export class OnScamOffersFoundCancelOffers implements EventListener<ScamOffersFoundEvent> {
    constructor(private readonly steps: DeliveryStepDispatcher) {}

    subscribedTo(): string {
        return ScamOffersFoundEvent.EVENT_NAME;
    }

    on(event: ScamOffersFoundEvent): Promise<void> {
        return event.payload.offers.reduce(
            (previous, offer) => previous.then(() => this.cancel(event, offer)),
            Promise.resolve(),
        );
    }

    private cancel(event: ScamOffersFoundEvent, offer: ScamOffer): Promise<void> {
        const { tradeId, accountId } = event.payload;
        return this.steps.dispatch(
            tradeId,
            new CancelTradeOfferCommand({ tradeId, accountId, offerId: offer.offerId, reasons: offer.reasons }),
        );
    }
}
