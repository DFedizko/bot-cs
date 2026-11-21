import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { EventBus } from "@/packages/application/event-bus";
import type { Logger } from "@/packages/application/logger";
import { Delivery } from "../../domain/delivery/delivery";
import { TradeId } from "../../domain/delivery/trade-id";
import type { DeliveryRepository } from "../delivery.repository";
import { StartDeliveryCommand } from "./start-delivery.command";

export class StartDeliveryCommandHandler implements CommandHandler<StartDeliveryCommand> {
    constructor(
        private readonly repository: DeliveryRepository,
        private readonly eventBus: EventBus,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return StartDeliveryCommand.COMMAND_NAME;
    }

    async handle(command: StartDeliveryCommand): Promise<void> {
        if (await this.repository.findByTradeId(new TradeId(command.tradeId)))
            return this.logger.log(`Delivery of trade "${command.tradeId}" is already tracked`);
        const delivery = this.startDelivery(command);
        await this.repository.save(delivery);
        await this.eventBus.publish(delivery.pullDomainEvents());
        this.logger.log(`Awaiting the offer of trade "${command.tradeId}" for account "${command.accountId}"`);
    }

    private startDelivery(command: StartDeliveryCommand): Delivery {
        return Delivery.start({
            tradeId: command.tradeId,
            tradeOfferId: command.tradeOfferId,
            accountId: command.accountId,
            expectedItem: { assetId: command.assetId, marketName: command.marketName, appId: command.appId },
            sellerSteamId: command.sellerSteamId,
        });
    }
}
