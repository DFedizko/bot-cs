import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import type { Logger } from "@/packages/application/logger";
import type { DeliveryRepository } from "../delivery.repository";
import type { DeliveryTrackers } from "../delivery-trackers";
import { TradeId } from "../../domain/delivery/trade-id";
import { TrackDeliveryCommand } from "./track-delivery.command";

export class TrackDeliveryCommandHandler implements CommandHandler<TrackDeliveryCommand> {
    constructor(
        private readonly repository: DeliveryRepository,
        private readonly trackers: DeliveryTrackers,
        private readonly logger: Logger,
    ) {}

    subscribedTo(): string {
        return TrackDeliveryCommand.COMMAND_NAME;
    }

    async handle(command: TrackDeliveryCommand): Promise<void> {
        const delivery = await this.repository.getByTradeId(new TradeId(command.tradeId));
        if (!delivery.isAwaitingOffer())
            return this.logger.log(`Not tracking trade "${command.tradeId}": it is ${delivery.getStatus()}`);
        const tradeId = delivery.getTradeId();
        const accountId = delivery.getAccountId();
        if (this.trackers.track({ tradeId, accountId, sentAt: command.sentAt }))
            this.logger.log(`Tracking the offer of trade "${tradeId}" for account "${accountId}"`);
    }
}
