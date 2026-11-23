import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { Delivery } from "../../domain/delivery/delivery";
import type { DeliveryRepository } from "../delivery.repository";
import { TradeId } from "../../domain/delivery/trade-id";
import type { OfferConfirmationGateway } from "./offer-confirmation.gateway";
import { ConfirmTradeOfferCommand } from "./confirm-trade-offer.command";

export class ConfirmTradeOfferCommandHandler implements CommandHandler<ConfirmTradeOfferCommand> {
    constructor(
        private readonly repository: DeliveryRepository,
        private readonly offerConfirmation: OfferConfirmationGateway,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return ConfirmTradeOfferCommand.COMMAND_NAME;
    }

    async handle(command: ConfirmTradeOfferCommand): Promise<void> {
        const delivery = await this.repository.getByTradeId(new TradeId(command.tradeId));
        const offerId = delivery.getAcceptedOfferId();
        if (!delivery.canBeConfirmed() || offerId === undefined)
            return this.logger.log(
                `Delivery of trade "${command.tradeId}" is ${delivery.getStatus()}, nothing to confirm`,
            );
        await this.confirmOnSteam(delivery, offerId);
        delivery.confirm();
        await this.repository.save(delivery);
        await this.eventBus.publish(delivery.pullDomainEvents());
        this.logger.log(`Confirmed offer "${offerId}" for trade "${delivery.getTradeId()}"`);
    }

    private async confirmOnSteam(delivery: Delivery, offerId: string): Promise<void> {
        if (delivery.needsConfirmation()) await this.offerConfirmation.confirm(delivery.getAccountId(), offerId);
    }
}
