import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import { TradeOfferAcceptedEvent } from "../../domain/delivery/events/trade-offer-accepted.event";
import { ConfirmTradeOfferCommand } from "./confirm-trade-offer.command";

export class OnTradeOfferAcceptedConfirm implements EventListener<TradeOfferAcceptedEvent> {
    constructor(private readonly commandBus: CommandBus) {}

    subscribedTo(): string {
        return TradeOfferAcceptedEvent.EVENT_NAME;
    }

    on(event: TradeOfferAcceptedEvent): Promise<void> {
        return this.commandBus.dispatch(new ConfirmTradeOfferCommand(event.payload.tradeId));
    }
}
