import type { CommandBus } from "@/packages/application/command-bus";
import type { EventListener } from "@/packages/application/event-listener";
import type { Logger } from "@/packages/application/logger";
import { ScamOfferFoundEvent } from "../accept-delivery-offer/scam-offer-found.event";
import { dispatchOrLog } from "../dispatch-or-log";
import { CancelTradeOfferCommand } from "./cancel-trade-offer.command";

export class OnScamOfferFoundCancelOffer implements EventListener<ScamOfferFoundEvent> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return ScamOfferFoundEvent.EVENT_NAME;
    }

    on(event: ScamOfferFoundEvent): Promise<void> {
        return dispatchOrLog(this.commandBus, this.logger, new CancelTradeOfferCommand(event.payload));
    }
}
