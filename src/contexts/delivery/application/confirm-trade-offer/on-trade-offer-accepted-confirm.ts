import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import type { Logger } from "@/packages/application/logger";
import { TradeOfferAcceptedEvent } from "../../domain/delivery/events/trade-offer-accepted.event";
import { dispatchOrLog } from "../dispatch-or-log";
import { ConfirmTradeOfferCommand } from "./confirm-trade-offer.command";

export class OnTradeOfferAcceptedConfirm implements EventListener<TradeOfferAcceptedEvent> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return TradeOfferAcceptedEvent.EVENT_NAME;
    }

    on(event: TradeOfferAcceptedEvent): Promise<void> {
        return dispatchOrLog(this.commandBus, this.logger, new ConfirmTradeOfferCommand(event.payload.tradeId));
    }
}
