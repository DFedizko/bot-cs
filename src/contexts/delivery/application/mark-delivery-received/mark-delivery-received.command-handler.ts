import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { CsgTradesGateway } from "../csg-trades.gateway";
import type { DeliveryRepository } from "../delivery.repository";
import { loadDelivery } from "../load-delivery";
import { MarkDeliveryReceivedCommand } from "./mark-delivery-received.command";

export class MarkDeliveryReceivedCommandHandler implements CommandHandler<MarkDeliveryReceivedCommand> {
    constructor(
        private readonly repository: DeliveryRepository,
        private readonly csgTrades: CsgTradesGateway,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return MarkDeliveryReceivedCommand.COMMAND_NAME;
    }

    async handle(command: MarkDeliveryReceivedCommand): Promise<void> {
        const delivery = await loadDelivery(this.repository, command.tradeId);
        if (!delivery.canBeMarkedReceived())
            return this.logger.log(`Delivery of trade "${command.tradeId}" is ${delivery.getStatus()}, not marking it`);
        await this.csgTrades.markAsReceived(delivery.getTradeOfferId());
        delivery.markReceived();
        await this.repository.save(delivery);
        await this.eventBus.publish(delivery.pullDomainEvents());
        this.logger.log(`Marked trade "${delivery.getTradeId()}" as received`);
    }
}
