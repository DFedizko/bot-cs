import type { EventListener } from "@/shared/application/event-listener";
import { ItemListedEvent } from "../events/item-listed.event";
import type { CommandBus } from "@/shared/infrastructure/command-bus/command-bus";
import type { DesiredItemRepository } from "../repositories/desired-item.repository";
import { PlaceBidCommand } from "../commands/place-bid.command";
import { BidIncrementer } from "../../domain/services/bid-incrementer";
import type { Logger } from "@/shared/application/logger";

export class ItemListedEventListener implements EventListener {
    constructor(
        private readonly desiredItemRepository: DesiredItemRepository,
        private readonly logger: Logger,
        private readonly commandBus: CommandBus,
    ) {}

    subscribedTo(): string {
        return ItemListedEvent.EVENT_NAME;
    }

    async on(event: ItemListedEvent): Promise<void> {
        const { id, name, aboveRecommendedPercentage, price, numberOfBids } = event.payload;
        const desiredItem = await this.desiredItemRepository.findByName(name);
        if (!desiredItem) return;
        const shouldBuy = desiredItem.criterias.some((criteria) => criteria.isSatisfiedBy(aboveRecommendedPercentage));
        if (!shouldBuy)
            return this.logger.log(`The item "${name}" did not meet criterion "IsEqualAboveRecommendedSpecification"`);
        const nextBid = BidIncrementer.nextFor({ value: price, numberOfBids });
        await this.commandBus.dispatch(
            new PlaceBidCommand({
                auctionId: id,
                bidValue: nextBid,
            }),
        );
    }
}
