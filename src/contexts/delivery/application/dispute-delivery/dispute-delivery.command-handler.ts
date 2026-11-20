import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import type { CsgoempireTradesGateway } from "../csgoempire-trades.gateway";
import type { DeliveryRepository } from "../delivery.repository";
import { loadDelivery } from "../load-delivery";
import { DeliveryDisputedEvent } from "./delivery-disputed.event";
import { DisputeDeliveryCommand } from "./dispute-delivery.command";

export class DisputeDeliveryCommandHandler implements CommandHandler<DisputeDeliveryCommand> {
    constructor(
        private readonly repository: DeliveryRepository,
        private readonly csgoempireTrades: CsgoempireTradesGateway,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return DisputeDeliveryCommand.COMMAND_NAME;
    }

    async handle(command: DisputeDeliveryCommand): Promise<void> {
        const delivery = await loadDelivery(this.repository, command.tradeId);
        if (!delivery.canBeDisputed())
            return this.logger.log(`Not disputing trade "${command.tradeId}": it is ${delivery.getStatus()}`);
        await this.csgoempireTrades.dispute(delivery.getTradeOfferId());
        delivery.dispute();
        await this.repository.save(delivery);
        await this.eventBus.publish([
            new DeliveryDisputedEvent({ tradeId: delivery.getTradeId(), accountId: delivery.getAccountId() }),
        ]);
        this.logger.log(`Disputed trade "${delivery.getTradeId()}" of account "${delivery.getAccountId()}"`);
    }
}
