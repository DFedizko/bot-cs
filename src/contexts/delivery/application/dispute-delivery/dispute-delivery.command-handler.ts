import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { CsgTradesGateway } from "../csg-trades.gateway";
import type { DeliveryRepository } from "../delivery.repository";
import { TradeId } from "../../domain/delivery/trade-id";
import { DisputeDeliveryCommand } from "./dispute-delivery.command";

export class DisputeDeliveryCommandHandler implements CommandHandler<DisputeDeliveryCommand> {
    constructor(
        private readonly repository: DeliveryRepository,
        private readonly csgTrades: CsgTradesGateway,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return DisputeDeliveryCommand.COMMAND_NAME;
    }

    async handle(command: DisputeDeliveryCommand): Promise<void> {
        const delivery = await this.repository.getByTradeId(new TradeId(command.tradeId));
        if (!delivery.canBeDisputed())
            return this.logger.log(`Not disputing trade "${command.tradeId}": it is ${delivery.getStatus()}`);
        await this.csgTrades.dispute(delivery.getTradeOfferId());
        delivery.dispute();
        await this.repository.save(delivery);
        await this.eventBus.publish(delivery.pullDomainEvents());
        this.logger.log(`Disputed trade "${delivery.getTradeId()}" of account "${delivery.getAccountId()}"`);
    }
}
