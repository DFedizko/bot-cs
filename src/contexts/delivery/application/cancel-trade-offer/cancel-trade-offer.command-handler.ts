import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { OfferCancellationGateway } from "./offer-cancellation.gateway";
import { CancelTradeOfferCommand } from "./cancel-trade-offer.command";
import { TradeOfferCancelledEvent } from "./trade-offer-cancelled.event";

export class CancelTradeOfferCommandHandler implements CommandHandler<CancelTradeOfferCommand> {
    constructor(
        private readonly offerCancellation: OfferCancellationGateway,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return CancelTradeOfferCommand.COMMAND_NAME;
    }

    async handle(command: CancelTradeOfferCommand): Promise<void> {
        await this.offerCancellation.cancel(command.accountId, command.offerId);
        await this.eventBus.publish([
            new TradeOfferCancelledEvent({
                tradeId: command.tradeId,
                accountId: command.accountId,
                offerId: command.offerId,
                reasons: [...command.reasons],
            }),
        ]);
        this.logger.log(`Cancelled offer "${command.offerId}": ${command.reasons.join(", ")}`);
    }
}
