import type { Logger } from "@/packages/application/logger";
import type { WantedItemRepository } from "../wanted-item.repository";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { EvaluateItemCommand } from "./evaluate-item.command";
import type { EventBus } from "@/packages/application/event-bus";
import { ItemApprovedInAuctionEvent } from "../events/item-approved-in-auction.event";
import { ItemApprovedOffAuctionEvent } from "../events/item-approved-off-auction.event";

export class EvaluateItemCommandHandler implements CommandHandler<EvaluateItemCommand> {
    constructor(
        private readonly wantedItemRepository: WantedItemRepository,
        private readonly logger: Logger,
        private readonly eventBus: EventBus,
    ) {}

    subscribedTo(): string {
        return EvaluateItemCommand.COMMAND_NAME;
    }

    async handle(command: EvaluateItemCommand): Promise<void> {
        const { id, itemName, aboveRecommendedPercentage, price, numberOfBids, inAuction } = command;
        const wantedItem = await this.wantedItemRepository.findByName(itemName);
        if (!wantedItem) return;
        const decision = wantedItem.evaluate({ value: price, aboveRecommendedPercentage });
        if (!decision.approved) return this.logger.log(decision.failures.join("; "));
        await this.eventBus.publish(
            inAuction
                ? [
                      new ItemApprovedInAuctionEvent({
                          auctionId: id,
                          value: price,
                          numberOfBids,
                      }),
                  ]
                : [new ItemApprovedOffAuctionEvent({ itemId: id, value: price })],
        );
    }
}
