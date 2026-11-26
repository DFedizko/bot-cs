import type { Logger } from "@/packages/application/logger";
import type { WantedItemRepository } from "../wanted-item.repository";
import type { CommandHandler } from "@/packages/building-blocks/command-handler";
import { EvaluateItemCommand } from "./evaluate-item.command";
import type { EventBus } from "@/packages/application/event-bus";
import { ItemApprovedInAuctionEvent } from "./item-approved-in-auction.event";
import { ItemApprovedOffAuctionEvent } from "./item-approved-off-auction.event";
import { AccountId } from "@/contexts/shared-kernel/domain/account-id";
import { ItemName } from "../../domain/wanted-item/item-name";

const FAILURE_SEPARATOR = "; ";

export class EvaluateItemCommandHandler implements CommandHandler<EvaluateItemCommand> {
    constructor(
        private readonly wantedItemRepository: WantedItemRepository,
        private readonly logger: Logger,
        private readonly eventBus: EventBus,
    ) {}

    subscribedTo(): string {
        return EvaluateItemCommand.COMMAND_NAME;
    }

    async handle({
        itemId,
        accountId,
        itemName,
        aboveRecommendedPercentage,
        price,
        referencePrice,
        inAuction,
    }: EvaluateItemCommand): Promise<void> {
        const wantedItem = await this.wantedItemRepository.findByName(new AccountId(accountId), new ItemName(itemName));
        if (!wantedItem) return;
        const decision = wantedItem.evaluate({ value: price, referencePrice, aboveRecommendedPercentage });
        if (decision.skipped) return this.logSkip(accountId, itemName, decision.failures);
        if (!decision.approved) return this.logger.log(decision.failures.join(FAILURE_SEPARATOR));
        await this.eventBus.publish(
            inAuction
                ? [
                      new ItemApprovedInAuctionEvent({
                          auctionId: itemId,
                          accountId,
                          value: price,
                          maxPrice: decision.maxPrice,
                      }),
                  ]
                : [new ItemApprovedOffAuctionEvent({ itemId, accountId, value: price })],
        );
    }

    private logSkip(accountId: number, itemName: string, failures: string[]): void {
        this.logger.debug(`Skipped "${itemName}" for account ${accountId}: ${failures.join(FAILURE_SEPARATOR)}`);
    }
}
