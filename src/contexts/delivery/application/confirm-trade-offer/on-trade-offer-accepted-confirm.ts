import type { EventListener } from "@/packages/application/event-listener";
import { TradeOfferAcceptedEvent } from "../../domain/delivery/events/trade-offer-accepted.event";
import type { DeliveryStepDispatcher } from "../delivery-step-dispatcher";
import { ConfirmTradeOfferCommand } from "./confirm-trade-offer.command";

export class OnTradeOfferAcceptedConfirm implements EventListener<TradeOfferAcceptedEvent> {
    constructor(private readonly steps: DeliveryStepDispatcher) {}

    subscribedTo(): string {
        return TradeOfferAcceptedEvent.EVENT_NAME;
    }

    on(event: TradeOfferAcceptedEvent): Promise<void> {
        return this.steps.dispatch(event.payload.tradeId, new ConfirmTradeOfferCommand(event.payload.tradeId));
    }
}
